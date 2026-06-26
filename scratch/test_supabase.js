import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const test = async () => {
  const sUrl = process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sUrl || !sKey) {
    console.error("Missing credentials");
    process.exit(1);
  }
  const supabase = createClient(sUrl, sKey);
  const { data, error } = await supabase.from('canteen_orders').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success! Row keys:", data.length > 0 ? Object.keys(data[0]) : "No rows found");
  }
  process.exit(0);
};

test();
