import { getStorage, connectToDatabase } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

async function checkConfig() {
  await connectToDatabase();
  const storage = getStorage();
  const companyInfo = await storage.getCompanyInfo();
  console.log("--- CONFIG CHECK ---");
  console.log("Company Info:", JSON.stringify(companyInfo, null, 2));
  console.log("--------------------");
}

checkConfig().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
