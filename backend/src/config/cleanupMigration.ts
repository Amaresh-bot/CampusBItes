import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const runCleanup = async () => {
  try {
    const mUri = process.env.MONGODB_URI;
    if (!mUri) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(mUri);
    console.log("Connected to MongoDB for cleaning user profiles...");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }
    const collection = db.collection('users');

    // 1. Drop the old unique index on rollNumber first to avoid duplicate key violations during the unset operation
    try {
      const indexes = await collection.indexes();
      const rollNumIndex = indexes.find(idx => idx.key && idx.key.rollNumber);
      if (rollNumIndex && rollNumIndex.name) {
        console.log(`Found index: ${rollNumIndex.name}. Dropping it...`);
        await collection.dropIndex(rollNumIndex.name);
        console.log(`Dropped index ${rollNumIndex.name} successfully.`);
      }
    } catch (e: any) {
      console.log(`⚠️ Warning: Could not drop old index on rollNumber: ${e.message}`);
    }

    // 2. Remove profileLocked from all documents
    const unsetProfileLockedRes = await collection.updateMany(
      {},
      { $unset: { profileLocked: "" } }
    );
    console.log(`🧹 Removed profileLocked from ${unsetProfileLockedRes.modifiedCount} user documents.`);

    // 3. Unset branch if it is "" or contains only whitespace
    const unsetBranchRes = await collection.updateMany(
      { branch: "" },
      { $unset: { branch: "" } }
    );
    console.log(`🧹 Removed empty branch from ${unsetBranchRes.modifiedCount} user documents.`);

    // 4. Unset academicYear if it is "" or contains only whitespace
    const unsetAcademicYearRes = await collection.updateMany(
      { academicYear: "" },
      { $unset: { academicYear: "" } }
    );
    console.log(`🧹 Removed empty academicYear from ${unsetAcademicYearRes.modifiedCount} user documents.`);

    // 5. Unset rollNumber if it is "" or starts with "TEMP_" or contains only whitespace
    const unsetRollNumberRes = await collection.updateMany(
      {
        $or: [
          { rollNumber: "" },
          { rollNumber: { $regex: /^TEMP_/i } }
        ]
      },
      { $unset: { rollNumber: "" } }
    );
    console.log(`🧹 Removed placeholder/empty rollNumber from ${unsetRollNumberRes.modifiedCount} user documents.`);

    // 6. Recreate unique sparse index on rollNumber
    try {
      await collection.createIndex({ rollNumber: 1 }, { unique: true, sparse: true });
      console.log("✅ Recreated unique sparse index on rollNumber successfully.");
    } catch (e: any) {
      console.error(`❌ Failed to create unique sparse index on rollNumber: ${e.message}`);
    }

    console.log("🎉 User database cleanup finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  }
};

runCleanup();
