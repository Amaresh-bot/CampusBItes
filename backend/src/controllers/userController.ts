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
    const { 
      userId, 
      fullName, 
      rollNumber, 
      rollNo, // Frontend name compatibility
      branch, 
      academicYear, 
      year, // Frontend name compatibility
      phoneNumber, 
      contactNo, // Frontend name compatibility
      collegeId 
    } = req.body;
    
    const finalRollNumber = rollNumber || rollNo;
    const finalAcademicYear = academicYear || year;
    const finalPhoneNumber = phoneNumber || contactNo;

    if (!userId || !fullName || !finalRollNumber) {
      return res.status(400).json({ success: false, message: 'userId, fullName, and rollNumber are required' });
    }
    
    // Check unique rollNumber except current user
    const existing = await User.findOne({ rollNumber: finalRollNumber.toUpperCase(), _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Roll number is already registered by another student' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.fullName = fullName;
    user.rollNumber = finalRollNumber.toUpperCase();
    user.branch = branch;
    user.academicYear = finalAcademicYear;
    user.phoneNumber = finalPhoneNumber;
    if (collegeId) user.collegeId = collegeId;
    user.profileLocked = true; // Lock profile details on save
    
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
