import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { PrintOrder } from '../models/PrintOrder';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData = req.body.order || req.body;
    const { userId, items, totalAmount, paymentMethod, paymentId, tokenNumber } = orderData;
    
    if (!userId || !items || !totalAmount || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'userId, items, totalAmount, and paymentMethod are required' });
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
    
    const token = tokenNumber || Math.floor(100 + Math.random() * 900).toString();
    
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
      status: 'Pending'
    });
    
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('new_order', order);
    }
    
    return res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const filter = userId ? { userId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({}).populate('userId').sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.status = status;
    await order.save(); // pre-save trigger adds to statusHistory!
    
    const io = req.app.get('io');
    if (io) {
      io.to(order.userId.toString()).emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        statusHistory: order.statusHistory
      });
    }
    
    return res.status(200).json({ success: true, order });
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
    
    const io = req.app.get('io');
    if (io) {
      io.emit('new_print_order', printOrder);
    }
    
    return res.status(201).json({ success: true, printOrder });
  } catch (err) {
    next(err);
  }
};

export const getPrintOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const filter = userId ? { userId } : {};
    const printOrders = await PrintOrder.find(filter).populate('userId').sort({ createdAt: -1 });
    return res.status(200).json(printOrders);
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
    
    const io = req.app.get('io');
    if (io) {
      io.to(order.userId.toString()).emit('print_order_status_updated', {
        orderId: order._id,
        status: order.status
      });
    }
    
    return res.status(200).json({ success: true, printOrder: order });
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
