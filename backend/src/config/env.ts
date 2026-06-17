import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Clean environment variables (removes quotes, trailing commas, trailing text, etc.)
const cleanEnvVar = (val: string | undefined, defaultValue: string = ''): string => {
  if (!val) return defaultValue;
  const trimmed = val.trim();
  if (!trimmed) return defaultValue;
  // Extract the first token before any spaces or commas to strip copy-pasted trailing notes
  const firstToken = trimmed.split(/[\s,]+/)[0];
  return firstToken.replace(/['"]/g, '').trim() || defaultValue;
};

// Clean URI/URL strings (retains full URL string but removes enclosing quotes and trailing spaces/commas)
const cleanUrl = (val: string | undefined, defaultValue: string = ''): string => {
  if (!val) return defaultValue;
  const trimmed = val.trim();
  if (!trimmed) return defaultValue;
  // Remove enclosing quotes or trailing commas
  return trimmed.replace(/^['"]|['"]$/g, '').replace(/,$/, '').trim() || defaultValue;
};

export const env = {
  PORT: process.env.PORT || '5000',
  MONGODB_URI: cleanUrl(process.env.MONGODB_URI),
  JWT_ACCESS_SECRET: cleanEnvVar(process.env.JWT_ACCESS_SECRET, 'AccessSecretKey123'),
  JWT_REFRESH_SECRET: cleanEnvVar(process.env.JWT_REFRESH_SECRET, 'RefreshSecretKey123'),
  ACCESS_TOKEN_EXPIRY: cleanEnvVar(process.env.ACCESS_TOKEN_EXPIRY, '15m'),
  REFRESH_TOKEN_EXPIRY: cleanEnvVar(process.env.REFRESH_TOKEN_EXPIRY, '7d'),
  GOOGLE_CLIENT_ID: cleanEnvVar(process.env.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: cleanEnvVar(process.env.GOOGLE_CLIENT_SECRET),
  GOOGLE_CALLBACK_URL: cleanUrl(process.env.GOOGLE_CALLBACK_URL, 'http://localhost:5000/api/auth/google/callback'),
  FRONTEND_URL: cleanUrl(process.env.FRONTEND_URL, 'http://localhost:5173'),
  RAZORPAY_KEY_ID: cleanEnvVar(process.env.RAZORPAY_KEY_ID),
  RAZORPAY_KEY_SECRET: cleanEnvVar(process.env.RAZORPAY_KEY_SECRET),
};
