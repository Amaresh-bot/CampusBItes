import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Transaction } from '../models/Transaction';

export const getStudentsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ role: 'customer' }).populate('collegeId');
    return res.status(200).json(users); // Return raw array directly!
  } catch (err) {
    next(err);
  }
};

export const verifyStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, isVerified } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId parameter' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    user.isVerified = isVerified === true;
    await user.save();

    return res.status(200).json({ success: true, profile: user });
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({}).populate('userId').sort({ createdAt: -1 });
    return res.status(200).json(orders); // Return raw array directly!
  } catch (err) {
    next(err);
  }
};

export const getPaymentLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 });
    
    const mapped = txs.map((t: any) => {
      let paymentId = "";
      let orderId = "";
      let status = "success";
      let comment = t.description || "";
      
      try {
        if (t.description && t.description.startsWith("{")) {
          const parsed = JSON.parse(t.description);
          paymentId = parsed.paymentId || parsed.payment_id || "";
          orderId = parsed.orderId || parsed.order_id || "";
          status = parsed.status || "success";
          comment = parsed.comment || parsed.description || "Wallet Transaction";
        }
      } catch (e) {
        // use string-based description directly
      }
      
      return {
        id: t._id.toString(),
        userId: t.userId,
        amount: t.amount,
        type: t.type === 'credit' ? 'topup' : 'payment', // map 'credit'/'debit' to 'topup'/'payment' for frontend
        description: comment,
        createdAt: t.createdAt,
        
        transaction_id: t._id.toString(),
        user_id: t.userId,
        payment_id: paymentId,
        order_id: orderId,
        status: status,
        timestamp: t.createdAt
      };
    });
    
    return res.status(200).json({ success: true, logs: mapped });
  } catch (err) {
    next(err);
  }
};
