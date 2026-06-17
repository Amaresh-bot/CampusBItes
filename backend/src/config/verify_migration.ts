import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { MenuItem } from '../models/MenuItem';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const verify = async () => {
  try {
    const sUrl = process.env.SUPABASE_URL || '';
    const sKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    const mUri = process.env.MONGODB_URI;

    if (!mUri) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(mUri);
    console.log("Connected to MongoDB for verification...");

    const supabase = createClient(sUrl, sKey);
    console.log("Connected to Supabase client...");

    // 1. Total MongoDB users vs Supabase users
    const mongoUserCount = await User.countDocuments();
    const { count: supabaseUserCount, error: pErr } = await supabase
      .from('canteen_student_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (pErr) throw pErr;

    // 2. Total MongoDB orders vs Supabase orders
    const mongoOrderCount = await Order.countDocuments();
    const { count: supabaseOrderCount, error: oErr } = await supabase
      .from('canteen_orders')
      .select('*', { count: 'exact', head: true });
      
    if (oErr) throw oErr;

    // 3. Validate all order.userId references & 4. Detect orphaned orders
    const orders = await Order.find();
    let orphanedOrdersCount = 0;
    const orphanedOrderDetails: string[] = [];
    for (const order of orders) {
      const userExists = await User.findById(order.userId);
      if (!userExists) {
        orphanedOrdersCount++;
        orphanedOrderDetails.push(`Order ID: ${order._id}, UserID Ref: ${order.userId}`);
      }
    }

    // 5. Detect duplicate users
    const duplicateUsers = await User.aggregate([
      { $group: { _id: "$email", count: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    // 6. Detect duplicate menu items
    const duplicateMenuItems = await MenuItem.aggregate([
      { $group: { _id: { name: "$name", canteenId: "$canteenId" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Mongoose database connection is not established.");
    }
    
    const userIndexes = await db.collection('users').listIndexes().toArray();
    const orderIndexes = await db.collection('orders').listIndexes().toArray();
    const menuIndexes = await db.collection('menuitems').listIndexes().toArray();

    const checkIndex = (indexes: any[], keyName: string) => {
      return indexes.some(idx => idx.key && idx.key[keyName] !== undefined);
    };

    const hasEmailIndex = checkIndex(userIndexes, 'email');
    const hasUserIdIndex = checkIndex(orderIndexes, 'userId');
    const hasStatusIndex = checkIndex(orderIndexes, 'status');
    const hasCanteenIdIndex = checkIndex(menuIndexes, 'canteenId');

    // Generate report contents
    const reportContent = `# Migration Verification Report

Generated on: ${new Date().toLocaleString()}

## 1. User Counts Comparison
* **Supabase Student Profiles**: ${supabaseUserCount || 0}
* **MongoDB User Documents**: ${mongoUserCount}
* **Match Status**: ${supabaseUserCount === mongoUserCount ? '✅ MATCH' : '⚠️ MISMATCH (Possible manual additions or filters)'}

## 2. Order Counts Comparison
* **Supabase Orders**: ${supabaseOrderCount || 0}
* **MongoDB Orders**: ${mongoOrderCount}
* **Match Status**: ${supabaseOrderCount === mongoOrderCount ? '✅ MATCH' : '⚠️ MISMATCH'}

## 3. Order Reference Integrity & Orphans
* **Orphaned Orders**: ${orphanedOrdersCount} ${orphanedOrdersCount === 0 ? '✅ (All order.userId references exist in User collection)' : '❌ (Some orders reference missing users)'}
${orphanedOrderDetails.length > 0 ? '\n### Orphan Details:\n' + orphanedOrderDetails.map(d => `* ${d}`).join('\n') : ''}

## 4. Duplicate User Detection
* **Duplicate User Emails**: ${duplicateUsers.length} ${duplicateUsers.length === 0 ? '✅ (No duplicates detected)' : '❌ (Duplicates found)'}
${duplicateUsers.length > 0 ? '\n### Duplicate Users:\n' + duplicateUsers.map(u => `* Email: ${u._id} (Occurrences: ${u.count})`).join('\n') : ''}

## 5. Duplicate Menu Items Detection
* **Duplicate Menu Items**: ${duplicateMenuItems.length} ${duplicateMenuItems.length === 0 ? '✅ (No duplicates detected)' : '❌ (Duplicates found)'}
${duplicateMenuItems.length > 0 ? '\n### Duplicate Menu Items:\n' + duplicateMenuItems.map(m => `* Item: ${m._id.name} in Canteen: ${m._id.canteenId} (Occurrences: ${m.count})`).join('\n') : ''}

## 6. Index Verifications
* **User Collection \`email\` Index**: ${hasEmailIndex ? '✅ Exists' : '❌ Missing'}
* **Order Collection \`userId\` Index**: ${hasUserIdIndex ? '✅ Exists' : '❌ Missing'}
* **Order Collection \`status\` Index**: ${hasStatusIndex ? '✅ Exists' : '❌ Missing'}
* **MenuItem Collection \`canteenId\` Index**: ${hasCanteenIdIndex ? '✅ Exists' : '❌ Missing'}

## 7. Migration Success Status
**Overall Status**: ${
  supabaseUserCount === mongoUserCount &&
  supabaseOrderCount === mongoOrderCount &&
  orphanedOrdersCount === 0 &&
  duplicateUsers.length === 0 &&
  duplicateMenuItems.length === 0 &&
  hasEmailIndex && hasUserIdIndex && hasStatusIndex && hasCanteenIdIndex
  ? '🎉 SUCCESS - Database is fully verified, consistent, and ready for production!'
  : '⚠️ WARNING - Some anomalies were detected. Check details above.'
}
`;

    console.log(reportContent);
    
    // Save inside backend folder
    const localReportPath = path.resolve(__dirname, '../../migration_verification_report.md');
    fs.writeFileSync(localReportPath, reportContent);
    console.log(`Local report written to: ${localReportPath}`);

    // Save in brain artifacts folder
    const artifactReportPath = 'C:\\Users\\jyoth\\.gemini\\antigravity\\brain\\5e8b75e6-f8ef-45e3-ad59-78ffa0e1bb5b\\migration_verification_report.md';
    try {
      fs.writeFileSync(artifactReportPath, reportContent);
      console.log(`Artifact report written to: ${artifactReportPath}`);
    } catch (e) {
      console.warn("Could not write directly to artifact path from node process:", e);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  }
};

verify();
