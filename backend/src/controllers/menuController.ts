import { Request, Response, NextFunction } from 'express';
import { MenuItem } from '../models/MenuItem';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canteenId, category } = req.query;
    const filter: any = {};
    
    if (canteenId) filter.canteenId = canteenId;
    if (category && category !== 'All') filter.category = category;
    
    const items = await MenuItem.find(filter).populate('canteenId');
    return res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

export const addMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canteenId, name, description, price, category, imageUrl, isAvailable, estimatedPrepTime, tags, isTodaySpecial } = req.body;
    
    if (!canteenId || !name || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'canteenId, name, price, and category are required' });
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
    
    await item.save();
    return res.status(201).json({ success: true, item });
  } catch (err) {
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
    
    return res.status(200).json({ success: true, item });
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
