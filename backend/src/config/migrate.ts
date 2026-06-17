import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { Order } from '../models/Order';
import { College } from '../models/College';
import { Canteen } from '../models/Canteen';
import { MenuItem } from '../models/MenuItem';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const migrate = async () => {
  try {
    const sUrl = process.env.SUPABASE_URL || '';
    const sKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    const mUri = process.env.MONGODB_URI;

    if (!mUri) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(mUri);
    console.log("Connected to MongoDB for data migration...");

    if (!sUrl || !sKey) {
      console.warn("⚠️ Supabase credentials not found in env. Skipping database transfer.");
      process.exit(0);
    }

    const supabase = createClient(sUrl, sKey);
    console.log("Connected to Supabase client...");

    let college = await College.findOne({ name: "Spoorthy Engineering College" });
    if (!college) {
      college = new College({
        name: "Spoorthy Engineering College",
        location: "Academic Campus Area, Hyderabad, India"
      });
      await college.save();
    }

    let canteen = await Canteen.findOne({ name: "Campus Cafe", collegeId: college._id });
    if (!canteen) {
      canteen = new Canteen({
        collegeId: college._id,
        name: "Campus Cafe",
        description: "Main central dining hall and student food store",
        isActive: true
      });
      await canteen.save();
      console.log("🏪 Created default Canteen:", canteen.name);
    }

    // Migrate Menu Items
    console.log("Migrating menu items...");
    const { data: menu, error: mErr } = await supabase.from('canteen_menu').select('*');
    if (mErr) throw mErr;

    if (menu && menu.length > 0) {
      for (const item of menu) {
        let mi = await MenuItem.findOne({ name: item.name, canteenId: canteen._id });
        if (!mi) {
          mi = new MenuItem({
            canteenId: canteen._id,
            name: item.name,
            description: item.description,
            price: Number(item.price),
            category: item.category,
            imageUrl: item.image_url,
            isAvailable: item.is_available ?? true,
            estimatedPrepTime: item.estimated_prep_time || 10,
            rating: Number(item.rating || 5.0),
            tags: item.tags || [],
            isTodaySpecial: item.is_today_special ?? false
          });
          await mi.save();
          console.log(`🍔 Migrated Menu Item: ${mi.name}`);
        }
      }
    }

    // Map to keep track of Supabase UUID -> MongoDB ObjectId associations
    const uuidMap = new Map<string, mongoose.Types.ObjectId>();

    // 1. Migrate Profiles -> User collection
    console.log("Migrating student profiles...");
    const { data: profiles, error: pErr } = await supabase.from('canteen_student_profiles').select('*');
    if (pErr) throw pErr;

    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        let u = await User.findOne({ email: p.email });
        if (!u) {
          u = new User({
            _id: new mongoose.Types.ObjectId(),
            email: p.email,
            fullName: p.full_name || p.fullName || "User",
            rollNumber: (p.roll_number || p.rollNumber || `TEMP_${p.id.substring(0, 8)}`).toUpperCase(),
            branch: p.branch || "",
            academicYear: p.academic_year || "",
            phoneNumber: p.phone_number || "",
            collegeId: college._id,
            role: 'customer',
            profileLocked: p.profile_locked ?? p.profileLocked ?? false
          });
          await u.save();
        }
        uuidMap.set(p.id, u._id as mongoose.Types.ObjectId);
        console.log(`👤 Migrated User profile: ${u.email} (Map: ${p.id} -> ${u._id})`);
      }
    }

    // 2. Migrate Wallets -> Wallet collection (Hashing PINs with bcrypt)
    console.log("Migrating wallets & hashing PINs...");
    try {
      const { data: wallets, error: wErr } = await supabase.from('canteen_wallets').select('*');
      if (wErr) throw wErr;

      if (wallets && wallets.length > 0) {
        for (const w of wallets) {
          const mongoUserId = uuidMap.get(w.user_id);
          if (!mongoUserId) {
            console.warn(`⚠️ Skipping wallet migration for user_id ${w.user_id}: User profile not found.`);
            continue;
          }

          let wallet = await Wallet.findOne({ userId: mongoUserId });
          if (!wallet) {
            const salt = await bcrypt.genSalt(10);
            const pinHash = await bcrypt.hash(w.pin || '1234', salt);
            
            wallet = new Wallet({
              userId: mongoUserId,
              balance: w.balance || 0.0,
              pinHash,
              isAutoTopupEnabled: w.is_auto_topup_enabled || false
            });
            await wallet.save();
            console.log(`💳 Migrated wallet for user: ${mongoUserId}`);
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to migrate wallets (table canteen_wallets may not exist in Supabase):", (err as any).message || err);
    }

    // 3. Migrate Orders -> Order collection
    console.log("Migrating orders...");
    try {
      const { data: orders, error: oErr } = await supabase.from('canteen_orders').select('*');
      if (oErr) throw oErr;

      if (orders && orders.length > 0) {
        for (const o of orders) {
          const mongoUserId = uuidMap.get(o.user_id);
          if (!mongoUserId) {
            console.warn(`⚠️ Skipping order migration for user_id ${o.user_id}: User profile not found.`);
            continue;
          }

          const orderExists = await Order.findOne({ userId: mongoUserId, createdAt: o.created_at });
          if (!orderExists) {
            const mappedItems = (o.items || []).map((item: any) => ({
              itemId: item.itemId || item.id || new mongoose.Types.ObjectId().toString(),
              name: item.name || 'Unknown Item',
              price: Number(item.price || 0),
              quantity: Number(item.quantity || 1),
              customInstructions: item.customInstructions || item.instructions || ''
            }));

            const newOrder = new Order({
              userId: mongoUserId,
              items: mappedItems,
              totalAmount: o.total_amount,
              status: o.status || 'Pending',
              paymentMethod: o.payment_method || 'wallet',
              paymentStatus: o.payment_status || 'Paid',
              paymentId: o.payment_id,
              tokenNumber: o.token_number,
              createdAt: o.created_at,
              updatedAt: o.created_at
            });
            await newOrder.save();
            console.log(`📦 Migrated order: ${newOrder._id} for user: ${mongoUserId}`);
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to migrate orders (table canteen_orders may not exist in Supabase):", (err as any).message || err);
    }

    console.log("🎉 Data migration from Supabase completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

migrate();
