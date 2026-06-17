import { Request, Response, NextFunction } from 'express';
import { College } from '../models/College';
import { Canteen } from '../models/Canteen';

export const getColleges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const colleges = await College.find({});
    return res.status(200).json({ success: true, colleges });
  } catch (err) {
    next(err);
  }
};

export const createCollege = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, location } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const college = new College({ name, location });
    await college.save();
    return res.status(201).json({ success: true, college });
  } catch (err) {
    next(err);
  }
};

export const getCanteensByCollege = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { collegeId } = req.params;
    const canteens = await Canteen.find({ collegeId, isActive: true });
    return res.status(200).json({ success: true, canteens });
  } catch (err) {
    next(err);
  }
};

export const createCanteen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { collegeId, name, description } = req.body;
    if (!collegeId || !name) {
      return res.status(400).json({ success: false, message: 'CollegeId and name are required' });
    }
    const canteen = new Canteen({ collegeId, name, description });
    await canteen.save();
    return res.status(201).json({ success: true, canteen });
  } catch (err) {
    next(err);
  }
};
