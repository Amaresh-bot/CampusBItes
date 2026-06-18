import { Request, Response, NextFunction } from 'express';
import { MenuItem } from '../models/MenuItem';
import { Canteen } from '../models/Canteen';

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
    let { canteenId, name, description, price, category, imageUrl, isAvailable, estimatedPrepTime, tags, isTodaySpecial } = req.body;
    
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
      console.warn("[addMenuItem] Validation failed: missing name, price, or category. Required fields status:", {
        hasName: !!name,
        hasPrice: price !== undefined,
        hasCategory: !!category
      });
      return res.status(400).json({ success: false, message: 'name, price, and category are required' });
    }
    
    const item = new MenuItem({
      canteenId,
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable,
      estimatedPrepTime,
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
