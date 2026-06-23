import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const brandingPath = path.resolve(__dirname, "../frontend/src/lib/branding.json");

const fallbackBranding = {
  companyName: "Sai Caterers",
  tagline: "Exceptional Food for Unforgettable Events",
  description: "Crafting unforgettable culinary memories with passion, precision, and the finest ingredients.",
  email: "phemanthkumar509@gmail.com",
  phone: "9177319695",
  address: "",
  eventsPerYear: 50,
  websiteUrl: "https://github.com/Hemanth509h/RailServe.git",
  upiId: "9177319695@upi",
  minAdvanceBookingDays: 2,
  yearsExperience: 1,
  logoUrl: "/leaf_logo.svg",
  primaryColor: "#ea580c",
  heroImages: [
    "https://png.pngtree.com/background/20230611/original/pngtree-many-different-kinds-of-food-are-arranged-on-a-table-picture-image_3145533.jpg"
  ],
  contactEmail: "phemanthkumar509@gmail.com",
  contactPhone: "9177319695",
  ownerName: "",
  ownerRole: "Founder & Catering Specialist",
  ownerBio: "",
  ownerImageUrl: "",
  ownerPhone: "",
  ownerEmail: "",
  workVideos: [
    "https://www.youtube.com/watch?v=RZJlok9VY2I"
  ],
};

export function readBrandingFile() {
  try {
    const raw = fs.readFileSync(brandingPath, "utf8");
    return { ...fallbackBranding, ...JSON.parse(raw) };
  } catch (error) {
    console.warn("Failed to read branding.json; using built-in fallback:", error.message);
    return fallbackBranding;
  }
}

export function normalizeBranding(data = {}) {
  const next = {
    ...readBrandingFile(),
    ...data,
  };

  next.contactEmail = next.contactEmail || next.email || "";
  next.email = next.email || next.contactEmail || "";
  next.contactPhone = next.contactPhone || next.phone || "";
  next.phone = next.phone || next.contactPhone || "";

  return next;
}

export function writeBrandingFile(data = {}) {
  const next = normalizeBranding(data);
  fs.writeFileSync(brandingPath, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

export async function seedBrandingFromFile(storage) {
  const existing = await storage.getCompanyInfo();
  if (existing?.companyName) return existing;

  const branding = readBrandingFile();
  console.log(`Seeding company info from branding.json (${branding.companyName})`);
  return storage.updateCompanyInfo(null, normalizeBranding(branding));
}

export function getPublicBaseUrl(req) {
  const configured =
    process.env.APP_BASE_URL ||
    process.env.PAYMENT_BASE_URL ||
    process.env.PP_BASE_URL ||
    process.env.FRONTEND_BASE_URL ||
    process.env.VITE_APP_BASE_URL;

  const requestOrigin = req?.get?.("origin");
  const requestReferer = req?.get?.("referer")?.split("/").slice(0, 3).join("/");
  const fallback = req ? `${req.protocol}://${req.get("host")}` : "";

  return (configured || requestOrigin || requestReferer || fallback).replace(/\/+$/, "");
}
