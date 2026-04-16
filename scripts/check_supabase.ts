import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  const tables = ["blogs", "gallery", "achievements", "goals", "messages"];
  console.log("Checking Supabase Connection and Tables...");
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select("*", { count: "estimated", head: true }).limit(1);
    if (error) {
      console.log(`❌ Table ${table} does not exist or error:`, error.message);
    } else {
      console.log(`✅ Table ${table} exists!`);
    }
  }
}

checkTables().catch(console.error);
