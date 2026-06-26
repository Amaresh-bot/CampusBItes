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

export const getOperatingHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let canteen = await Canteen.findOne({});
    if (!canteen) {
      const CollegeModel = require('../models/College').College;
      let college = await CollegeModel.findOne({});
      if (!college) {
        college = await CollegeModel.create({
          name: "Spoorthy Engineering College",
          location: "Academic Campus Area, Hyderabad, India"
        });
      }
      canteen = await Canteen.create({
        collegeId: college._id,
        name: "Campus Cafe",
        description: "Main central dining hall and student food store",
        isActive: true,
        openingTime: "08:00",
        closingTime: "20:00",
        isTemporarilyClosed: false
      });
    }
    return res.status(200).json({
      success: true,
      openingTime: canteen.openingTime || "08:00",
      closingTime: canteen.closingTime || "20:00",
      isTemporarilyClosed: canteen.isTemporarilyClosed || false
    });
  } catch (err) {
    next(err);
  }
};

export const updateOperatingHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { openingTime, closingTime, isTemporarilyClosed } = req.body;
    let canteen = await Canteen.findOne({});
    if (!canteen) {
      const CollegeModel = require('../models/College').College;
      let college = await CollegeModel.findOne({});
      if (!college) {
        college = await CollegeModel.create({
          name: "Spoorthy Engineering College",
          location: "Academic Campus Area, Hyderabad, India"
        });
      }
      canteen = await Canteen.create({
        collegeId: college._id,
        name: "Campus Cafe",
        description: "Main central dining hall and student food store",
        isActive: true
      });
    }
    
    if (openingTime !== undefined) canteen.openingTime = openingTime;
    if (closingTime !== undefined) canteen.closingTime = closingTime;
    if (isTemporarilyClosed !== undefined) canteen.isTemporarilyClosed = isTemporarilyClosed;
    
    await canteen.save();
    return res.status(200).json({
      success: true,
      message: "Operating hours updated successfully",
      openingTime: canteen.openingTime,
      closingTime: canteen.closingTime,
      isTemporarilyClosed: canteen.isTemporarilyClosed
    });
  } catch (err) {
    next(err);
  }
};
