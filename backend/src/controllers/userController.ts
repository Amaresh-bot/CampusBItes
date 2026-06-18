import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';

export const getStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('collegeId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const profileResponse = {
      ...user.toObject(),
      id: user._id.toString(),
      rollNo: user.rollNumber,
      year: user.academicYear,
      contactNo: user.phoneNumber
    };

    return res.status(200).json({
      ...profileResponse,
      success: true,
      profile: profileResponse
    });
  } catch (err) {
    next(err);
  }
};

export const saveStudentProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const source = req.body.profile || req.body;
    const userId = req.body.userId || source.userId;
    const fullName = source.fullName;
    const rollNumber = source.rollNumber;
    const rollNo = source.rollNo;
    const branch = source.branch;
    const academicYear = source.academicYear;
    const year = source.year;
    const phoneNumber = source.phoneNumber;
    const contactNo = source.contactNo;
    const collegeId = source.collegeId;

    const finalRollNumber = rollNumber || rollNo;
    const finalAcademicYear = academicYear || year;
    const finalPhoneNumber = phoneNumber || contactNo;

    if (!userId || !fullName) {
      return res.status(400).json({ success: false, message: 'userId and fullName are required' });
    }
    
    // Check unique rollNumber except current user if provided
    if (finalRollNumber && finalRollNumber.trim() !== "") {
      const existing = await User.findOne({ rollNumber: finalRollNumber.trim().toUpperCase(), _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Roll number is already registered by another student' });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.fullName = fullName;
    user.rollNumber = finalRollNumber && finalRollNumber.trim() !== "" ? finalRollNumber.trim().toUpperCase() : undefined;
    user.branch = branch && branch.trim() !== "" ? branch.trim() : undefined;
    user.academicYear = finalAcademicYear && finalAcademicYear.trim() !== "" ? finalAcademicYear.trim() : undefined;
    user.phoneNumber = finalPhoneNumber && finalPhoneNumber.trim() !== "" ? finalPhoneNumber.trim() : undefined;
    
    if (collegeId) {
      user.collegeId = collegeId;
    } else {
      user.collegeId = undefined;
    }
    
    await user.save();

    // Auto-create Wallet for new profiles if not already present
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0.0 });
      await wallet.save();
    }
    
    const profileResponse = {
      ...user.toObject(),
      id: user._id.toString(),
      rollNo: user.rollNumber,
      year: user.academicYear,
      contactNo: user.phoneNumber
    };

    return res.status(200).json({
      ...profileResponse,
      success: true,
      profile: profileResponse
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({ role: 'customer' }).populate('collegeId');
    const mappedUsers = users.map(user => ({
      ...user.toObject(),
      id: user._id.toString(),
      rollNo: user.rollNumber,
      year: user.academicYear,
      contactNo: user.phoneNumber
    }));
    return res.status(200).json({ success: true, students: mappedUsers });
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

    const profileResponse = {
      ...user.toObject(),
      id: user._id.toString(),
      rollNo: user.rollNumber,
      year: user.academicYear,
      contactNo: user.phoneNumber
    };

    return res.status(200).json({
      ...profileResponse,
      success: true,
      profile: profileResponse
    });
  } catch (err) {
    next(err);
  }
};
