import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';

let razorpay: any = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
  });
}

export const createRazorpayOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, currency } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }
    
    if (!razorpay) {
      return res.status(200).json({
        success: true,
        orderId: `order_mock_${Math.random().toString(36).substring(2, 12)}`,
        mock: true
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      success: true,
      mock: false,
      keyId: env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      prefillMethod: "upi",
      checkoutConfig: {
        display: {
          blocks: {
            upi: {
              name: "UPI / Google Pay / PhonePe",
              instruments: [
                {
                  method: "upi",
                  flows: ["intent", "qr", "collect"]
                }
              ]
            }
          },
          sequence: ["block.upi"],
          preferences: {
            show_default_blocks: true
          }
        }
      },
      order
    });
  } catch (err) {
    next(err);
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, topupAmount } = req.body;

    console.log("Payment verification started for Razorpay Order ID:", razorpayOrderId);
    console.log("Details:", { razorpayPaymentId, userId, topupAmount });

    if (!razorpayOrderId || !razorpayPaymentId) {
      console.warn("Validation failed: razorpayOrderId and razorpayPaymentId are required");
      return res.status(400).json({ success: false, message: 'razorpayOrderId and razorpayPaymentId are required' });
    }

    let isVerified = false;
    
    if (razorpaySignature && razorpay) {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isVerified = generatedSignature === razorpaySignature;
      console.log("Razorpay signature match verified:", isVerified);
    } else {
      isVerified = true;
      console.log("Verification bypassed (no signature/razorpay instance): verified = true");
    }

    if (!isVerified) {
      console.warn("Payment verification failed: signature mismatch");
      return res.status(400).json({ success: false, message: 'Payment verification failed. Signature mismatch.' });
    }

    if (userId && topupAmount) {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found' });
      }

      wallet.balance += parseFloat(topupAmount);
      await wallet.save();

      const tx = new Transaction({
        userId,
        amount: parseFloat(topupAmount),
        type: 'credit',
        description: `Wallet topup via Razorpay: ${razorpayPaymentId}`
      });
      await tx.save();

      return res.status(200).json({ success: true, message: 'Wallet topped up successfully', wallet });
    }

    return res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    next(err);
  }
};
