import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { College } from '../models/College';
import { Canteen } from '../models/Canteen';
import { MenuItem } from '../models/MenuItem';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const seed = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI is required");
    }

    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    await College.deleteMany({});
    await Canteen.deleteMany({});
    await MenuItem.deleteMany({});

    // 1. Seed College
    const college = new College({
      name: "Spoorthy Engineering College",
      location: "Academic Campus Area, Hyderabad, India"
    });
    await college.save();
    console.log("✅ Seeded College:", college.name);

    // 2. Seed Canteen
    const canteen = new Canteen({
      collegeId: college._id,
      name: "Campus Cafe",
      description: "Main central dining hall and student food store",
      isActive: true
    });
    await canteen.save();
    console.log("✅ Seeded Canteen:", canteen.name);

    // 3. Seed Menu Items
    const menuItems = [
      {
        canteenId: canteen._id,
        name: "Crispy Dosa",
        description: "Freshly baked golden crepe served with coconut chutney & sambar.",
        price: 80,
        category: "Breakfast",
        isAvailable: true,
        estimatedPrepTime: 8,
        rating: 5.0,
        tags: ["Vegetarian", "Best Seller"],
        isTodaySpecial: true
      },
      {
        canteenId: canteen._id,
        name: "Masala Chai",
        description: "Hot brewed Indian tea infused with cardamoms, ginger, and spices.",
        price: 20,
        category: "Beverages",
        isAvailable: true,
        estimatedPrepTime: 5,
        rating: 4.8,
        tags: ["Vegetarian", "Hot Beverage"],
        isTodaySpecial: false
      },
      {
        canteenId: canteen._id,
        name: "Golden Samosa",
        description: "Crispy triangular pastry stuffed with spiced potato and pea fillings.",
        price: 35,
        category: "Snacks",
        isAvailable: true,
        estimatedPrepTime: 5,
        rating: 4.7,
        tags: ["Vegetarian", "Snack"],
        isTodaySpecial: false
      },
      {
        canteenId: canteen._id,
        name: "Paneer Butter Masala & Naan",
        description: "Creamy butter curry served with two baked tandoori naans.",
        price: 150,
        category: "Meals",
        isAvailable: true,
        estimatedPrepTime: 12,
        rating: 4.9,
        tags: ["Vegetarian", "Premium Meal"],
        isTodaySpecial: true
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log("✅ Seeded Menu Items");

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();
