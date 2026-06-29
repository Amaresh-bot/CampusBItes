import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { PrintOrder } from '../models/PrintOrder';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { Counter } from '../models/Counter';
import { MenuItem } from '../models/MenuItem';
import { Canteen } from '../models/Canteen';
import mongoose from 'mongoose';

const getYYMMDD = (date: Date): string => {
  const yy = String(date.getFullYear()).substring(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

const parseDateToYYMMDD = (dateStr?: string): string => {
  if (!dateStr) return getYYMMDD(new Date());
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const yy = parts[0].substring(2);
    const mm = parts[1].padStart(2, '0');
    const dd = parts[2].padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }
  return getYYMMDD(new Date());
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData = req.body.order || req.body;
    const { userId, items, totalAmount, paymentMethod, paymentId, tokenNumber, scheduledDate } = orderData;
    
    console.log("Creating order: starting order compilation in backend MERN");
    console.log("Payload values:", { userId, paymentMethod, paymentId, totalAmount, itemsCount: items?.length, scheduledDate });
    
    if (!userId || !items || !totalAmount || !paymentMethod) {
      console.warn("Validation failed: missing required fields");
      return res.status(400).json({ success: false, message: 'userId, items, totalAmount, and paymentMethod are required' });
    }
    
    // 1. Validate Canteen Operating Hours
    const canteen = await Canteen.findOne({});
    if (canteen) {
      if (canteen.isTemporarilyClosed) {
        return res.status(400).json({ success: false, message: 'Canteen is temporarily closed' });
      }
      if (!scheduledDate) {
        const now = new Date();
        // Convert server time to Indian Standard Time (IST, UTC+5:30)
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const currentHHMM = `${String(istTime.getUTCHours()).padStart(2, '0')}:${String(istTime.getUTCMinutes()).padStart(2, '0')}`;
        const opening = canteen.openingTime || "08:00";
        const closing = canteen.closingTime || "20:00";
        if (currentHHMM < opening || currentHHMM > closing) {
          return res.status(400).json({ 
            success: false, 
            message: `Canteen is closed. Operating hours: ${opening} - ${closing}. Current time (IST): ${currentHHMM}` 
          });
        }
      }
    }

    // 2. Validate Stock for all items (First Pass)
    const menuItemsToUpdate = [];
    for (const item of items) {
      const itemId = item.itemId || item.id;
      const menuItem = await MenuItem.findById(itemId);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item ${item.name || itemId} not found` });
      }
      if (menuItem.availableStock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${menuItem.name}. Available: ${menuItem.availableStock}, Requested: ${item.quantity}` 
        });
      }
      menuItemsToUpdate.push({ menuItem, quantity: item.quantity });
    }

    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || wallet.balance < totalAmount) {
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      }
      
      wallet.balance -= totalAmount;
      await wallet.save();
      
      const tx = new Transaction({
        userId,
        amount: totalAmount,
        type: 'debit',
        description: `Order placement token payment`
      });
      await tx.save();
    }

    // 3. Decrement Stock (Second Pass)
    for (const update of menuItemsToUpdate) {
      update.menuItem.availableStock -= update.quantity;
      if (update.menuItem.availableStock === 0) {
        update.menuItem.isAvailable = false;
      }
      await update.menuItem.save();
    }
    
    // Determine mealCategory
    let resolvedCategory: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner' = 'Snacks';
    try {
      const firstItem = items?.[0];
      let itemCategory = firstItem?.category;

      if (!itemCategory && firstItem?.itemId) {
        const MenuItemModel = mongoose.model('MenuItem');
        const menuItem = await MenuItemModel.findById(firstItem.itemId);
        if (menuItem) {
          itemCategory = menuItem.category;
        }
      }

      if (itemCategory) {
        const cat = itemCategory.trim().toLowerCase();
        if (cat.includes('breakfast')) {
          resolvedCategory = 'Breakfast';
        } else if (cat.includes('lunch')) {
          resolvedCategory = 'Lunch';
        } else if (cat.includes('dinner')) {
          resolvedCategory = 'Dinner';
        } else if (
          cat.includes('snack') || 
          cat.includes('beverage') || 
          cat.includes('dessert') || 
          cat.includes('drink') || 
          cat.includes('tea') || 
          cat.includes('coffee') || 
          cat.includes('bev')
        ) {
          resolvedCategory = 'Snacks';
        } else {
          // Fallback to time of day for "Meals", etc.
          const hour = new Date().getHours();
          if (hour < 11) {
            resolvedCategory = 'Breakfast';
          } else if (hour < 16) {
            resolvedCategory = 'Lunch';
          } else if (hour < 18) {
            resolvedCategory = 'Snacks';
          } else {
            resolvedCategory = 'Dinner';
          }
        }
      } else {
        // Fallback to time of day
        const hour = new Date().getHours();
        if (hour < 11) {
          resolvedCategory = 'Breakfast';
        } else if (hour < 16) {
          resolvedCategory = 'Lunch';
        } else if (hour < 18) {
          resolvedCategory = 'Snacks';
        } else {
          resolvedCategory = 'Dinner';
        }
      }
    } catch (err) {
      console.warn("Failed to determine meal category, defaulting to Snacks:", err);
    }

    // Generate token atomically using Counter
    let token = tokenNumber;
    let tokenSeq: number | undefined = undefined;
    
    if (!token) {
      const prefixMap: Record<string, string> = {
        'Breakfast': 'B',
        'Lunch': 'L',
        'Snacks': 'S',
        'Dinner': 'D'
      };
      const categoryPrefix = prefixMap[resolvedCategory] || 'S';
      const yymmdd = parseDateToYYMMDD(scheduledDate);
      const counterKey = `token_${categoryPrefix}_${yymmdd}`;
      
      const counter = await Counter.findOneAndUpdate(
        { key: counterKey },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      );
      
      tokenSeq = counter.sequence;
      const formattedSeq = String(tokenSeq).padStart(3, '0');
      token = `${yymmdd}-${categoryPrefix}-${formattedSeq}`;
    }
    
    const normalizedItems = (items || []).map((item: any) => ({
      itemId: item.itemId || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      customInstructions: item.customInstructions
    }));
    
    const order = new Order({
      userId,
      items: normalizedItems,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'wallet' || paymentId || (orderData.paymentStatus === 'Paid') ? 'Paid' : 'Pending',
      paymentId,
      tokenNumber: token,
      mealCategory: resolvedCategory,
      tokenSequence: tokenSeq,
      scheduledDate: scheduledDate || null,
      status: 'Pending'
    });
    
    await order.save();
    console.log("Order created successfully in MongoDB Atlas. ID:", order._id);

    const mappedOrder = {
      ...order.toObject(),
      id: order._id.toString()
    };

    const io = req.app.get('io');
    if (io) {
      io.emit('new_order', mappedOrder);
    }
    
    return res.status(201).json({ success: true, order: mappedOrder });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const filter = userId ? { userId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const mappedOrders = orders.map(order => ({
      ...order.toObject(),
      id: order._id.toString()
    }));
    return res.status(200).json(mappedOrders);
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({}).populate('userId').sort({ createdAt: -1 });
    const mappedOrders = orders.map(order => ({
      ...order.toObject(),
      id: order._id.toString()
    }));
    return res.status(200).json(mappedOrders);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { status, estimatedReadyAt } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if status is transitioning to Cancelled
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        const menuItem = await MenuItem.findById(item.itemId);
        if (menuItem) {
          menuItem.availableStock += item.quantity;
          if (menuItem.availableStock > 0) {
            menuItem.isAvailable = true;
          }
          await menuItem.save();
        }
      }
    }
    
    order.status = status;
    if (estimatedReadyAt) {
      order.estimatedReadyAt = estimatedReadyAt;
    }
    await order.save(); // pre-save trigger adds to statusHistory!
    
    const mappedOrder = {
      ...order.toObject(),
      id: order._id.toString()
    };
    
    const io = req.app.get('io');
    if (io) {
      io.to(order.userId.toString()).emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        statusHistory: order.statusHistory,
        estimatedReadyAt: order.estimatedReadyAt
      });
    }
    
    return res.status(200).json({ success: true, order: mappedOrder });
  } catch (err) {
    next(err);
  }
};

export const createPrintOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, studentName, rollNumber, department, contactNumber, pickupTimeSlot, items, subtotal, tax, total, upiUtr, upiScreenshot, upiApp } = req.body;
    
    if (!userId || !studentName || !rollNumber || !contactNumber || !items || !total) {
      return res.status(400).json({ success: false, message: 'Missing required fields for print order' });
    }
    
    const printOrder = new PrintOrder({
      userId,
      studentName,
      rollNumber,
      department,
      contactNumber,
      pickupTimeSlot,
      items,
      subtotal,
      tax,
      total,
      status: 'PENDING',
      upiUtr,
      upiScreenshot,
      upiApp
    });
    
    await printOrder.save();
    
    const mappedPrintOrder = {
      ...printOrder.toObject(),
      orderId: printOrder._id.toString()
    };
    
    const io = req.app.get('io');
    if (io) {
      io.emit('new_print_order', mappedPrintOrder);
    }
    
    return res.status(201).json({ success: true, printOrder: mappedPrintOrder });
  } catch (err) {
    next(err);
  }
};

export const getPrintOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const filter = userId ? { userId } : {};
    const printOrders = await PrintOrder.find(filter).populate('userId').sort({ createdAt: -1 });
    const mappedPrintOrders = printOrders.map(slip => ({
      ...slip.toObject(),
      orderId: slip._id.toString()
    }));
    return res.status(200).json(mappedPrintOrders);
  } catch (err) {
    next(err);
  }
};

export const updatePrintOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await PrintOrder.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Print order not found' });
    }
    
    const mappedPrintOrder = {
      ...order.toObject(),
      orderId: order._id.toString()
    };
    
    const io = req.app.get('io');
    if (io) {
      io.to(order.userId.toString()).emit('print_order_status_updated', {
        orderId: order._id,
        status: order.status
      });
    }
    
    return res.status(200).json({ success: true, printOrder: mappedPrintOrder });
  } catch (err) {
    next(err);
  }
};

export const deletePrintOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const order = await PrintOrder.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Print order not found' });
    }
    return res.status(200).json({ success: true, message: 'Print order deleted successfully' });
  } catch (err) {
    next(err);
  }
};
