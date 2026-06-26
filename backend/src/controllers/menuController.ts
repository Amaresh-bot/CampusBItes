import { Request, Response, NextFunction } from 'express';
import { MenuItem } from '../models/MenuItem';
import { Canteen } from '../models/Canteen';
import { StockLog } from '../models/StockLog';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import mongoose from 'mongoose';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canteenId, category } = req.query;
    const filter: any = {};
    
    if (canteenId) filter.canteenId = canteenId;
    if (category && category !== 'All') filter.category = category;
    
    const items = await MenuItem.find(filter).populate('canteenId');
    const mappedItems = items.map(item => ({
      ...item.toObject(),
      id: item._id.toString()
    }));
    return res.status(200).json(mappedItems);
  } catch (err) {
    next(err);
  }
};

export const addMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  console.log("[addMenuItem] Controller initiated with req.body:", req.body);
  try {
    let { canteenId, name, description, price, category, imageUrl, isAvailable, estimatedPrepTime, prepTime, tags, isTodaySpecial, availableStock, batchSize, cookTime } = req.body;
    
    // Auto-resolve canteenId for single-canteen setups if frontend doesn't provide it
    if (!canteenId) {
      console.log("[addMenuItem] No canteenId provided in payload. Looking up default Canteen...");
      const defaultCanteen = await Canteen.findOne({});
      if (defaultCanteen) {
        canteenId = defaultCanteen._id.toString();
        console.log(`[addMenuItem] Resolved default canteen: "${defaultCanteen.name}" (ID: ${canteenId})`);
      } else {
        console.error("[addMenuItem] No canteens exist in the database.");
        return res.status(400).json({ 
          success: false, 
          message: 'canteenId is missing and no default canteen was found in the database. Please initialize the database.' 
        });
      }
    }
    
    if (!name || price === undefined || !category) {
      console.warn("[addMenuItem] Validation failed: missing name, price, or category.");
      return res.status(400).json({ success: false, message: 'name, price, and category are required' });
    }
    
    const resolvedPrepTime = estimatedPrepTime !== undefined ? Number(estimatedPrepTime) : (prepTime !== undefined ? Number(prepTime) : 10);
    
    const item = new MenuItem({
      canteenId,
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      estimatedPrepTime: resolvedPrepTime,
      availableStock: availableStock !== undefined ? Number(availableStock) : 50,
      batchSize: batchSize !== undefined ? Number(batchSize) : 2,
      cookTime: cookTime !== undefined ? Number(cookTime) : resolvedPrepTime,
      tags,
      isTodaySpecial
    });
    
    console.log("[addMenuItem] Saving new MenuItem to MongoDB...");
    await item.save();
    
    const mappedItem = {
      ...item.toObject(),
      id: item._id.toString()
    };
    console.log("[addMenuItem] MenuItem saved successfully. Generated ID:", mappedItem.id);
    return res.status(201).json({ success: true, item: mappedItem });
  } catch (err: any) {
    console.error("[addMenuItem] Error saving menu item to MongoDB:", err);
    next(err);
  }
};

export const editMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;
    const updates = req.body;
    
    const prevItem = await MenuItem.findById(itemId);
    if (!prevItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Support prepTime mapping to estimatedPrepTime
    if (updates.prepTime !== undefined && updates.estimatedPrepTime === undefined) {
      updates.estimatedPrepTime = Number(updates.prepTime);
    }
    
    // Log stock changes for audit purposes
    if (updates.availableStock !== undefined && Number(updates.availableStock) !== prevItem.availableStock) {
      const adminId = (req as any).user?.id || updates.adminId || null;
      const adminName = (req as any).user?.name || updates.adminName || 'Admin';
      
      // Auto-update availability based on stock
      const stock = Number(updates.availableStock);
      if (stock === 0) {
        updates.isAvailable = false;
      } else if (stock > 0 && prevItem.availableStock === 0 && updates.isAvailable === undefined) {
        updates.isAvailable = true;
      }

      if (adminId) {
        await StockLog.create({
          menuItemId: itemId,
          itemName: prevItem.name,
          previousStock: prevItem.availableStock,
          newStock: stock,
          adminId,
          adminName
        });
      }
    }
    
    const item = await MenuItem.findByIdAndUpdate(itemId, updates, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    const mappedItem = {
      ...item.toObject(),
      id: item._id.toString()
    };
    return res.status(200).json({ success: true, item: mappedItem });
  } catch (err) {
    next(err);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;
    
    const item = await MenuItem.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    return res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// --- Item Reviews & Ratings Controllers ---
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;
    const reviews = await Review.find({ menuItemId: itemId }).populate('userId', 'fullName name email');
    const mappedReviews = reviews.map(r => ({
      id: r._id.toString(),
      userId: r.userId?._id?.toString() || (r.userId as any)?.id || r.userId,
      userName: (r.userId as any)?.fullName || (r.userId as any)?.name || 'Anonymous',
      userEmail: (r.userId as any)?.email || '',
      menuItemId: r.menuItemId.toString(),
      rating: r.rating,
      review: r.review,
      createdAt: r.createdAt.toISOString()
    }));
    return res.status(200).json(mappedReviews);
  } catch (err) {
    next(err);
  }
};

export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;
    const { rating, review: reviewText } = req.body;
    const userId = (req as any).user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User session not found.' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating between 1 and 5 is required' });
    }
    
    // 1. Verify if user has a Completed order containing this item
    const completedOrder = await Order.findOne({
      userId,
      status: 'Completed',
      'items.itemId': itemId
    });
    
    if (!completedOrder) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only users who have purchased this item can submit a rating and review.' 
      });
    }
    
    // 2. Check if user already reviewed this item. If so, overwrite it.
    let existingReview = await Review.findOne({ userId, menuItemId: itemId });
    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.review = reviewText || '';
      await existingReview.save();
      return res.status(200).json({ success: true, message: 'Review updated successfully', review: existingReview });
    }
    
    const newReview = new Review({
      userId,
      menuItemId: itemId,
      rating: Number(rating),
      review: reviewText || ''
    });
    await newReview.save();
    return res.status(201).json({ success: true, message: 'Review submitted successfully', review: newReview });
  } catch (err) {
    next(err);
  }
};

export const editReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const { rating, review: reviewText } = req.body;
    const userId = (req as any).user?.id || req.body.userId;
    
    const rev = await Review.findById(reviewId);
    if (!rev) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (rev.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this review' });
    }
    
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating between 1 and 5 is required' });
      }
      rev.rating = Number(rating);
    }
    if (reviewText !== undefined) {
      rev.review = reviewText;
    }
    
    await rev.save();
    return res.status(200).json({ success: true, message: 'Review updated successfully', review: rev });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user?.id || req.body.userId;
    
    const rev = await Review.findById(reviewId);
    if (!rev) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (rev.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this review' });
    }
    
    const itemId = rev.menuItemId;
    await Review.findByIdAndDelete(reviewId);
    
    // Recalculate average rating after delete
    const stats = await Review.aggregate([
      { $match: { menuItemId: itemId } },
      { $group: { _id: '$menuItemId', avgRating: { $avg: '$rating' } } }
    ]);
    
    const avg = stats.length > 0 ? parseFloat(stats[0].avgRating.toFixed(1)) : 5.0;
    await MenuItem.findByIdAndUpdate(itemId, { rating: avg });
    
    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
};
