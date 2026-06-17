import { Request, Response, NextFunction } from 'express';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';

export const getWalletByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0.0 });
      await wallet.save();
    }
    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    next(err);
  }
};

export const updateAutoTopup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, isAutoTopupEnabled } = req.body;
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { isAutoTopupEnabled },
      { new: true, upsert: true }
    );
    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    next(err);
  }
};

export const verifyWalletPIN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, pin } = req.body;
    if (!userId || !pin) {
      return res.status(400).json({ success: false, message: 'userId and pin are required' });
    }
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0.0 });
      await wallet.save();
    }

    const isMatch = await wallet.comparePIN(pin);
    return res.status(200).json({ success: true, verified: isMatch });
  } catch (err) {
    next(err);
  }
};

export const updateWalletPIN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, pin } = req.body;
    if (!userId || !pin) {
      return res.status(400).json({ success: false, message: 'userId and pin are required' });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }
    
    wallet.pinHash = pin; // Mongoose pre-save hook handles hashing
    await wallet.save();
    
    return res.status(200).json({ success: true, message: 'PIN updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const getTransactionsByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
};
