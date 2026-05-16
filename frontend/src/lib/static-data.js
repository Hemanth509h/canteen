import branding from "./branding.json";

export const STATIC_COMPANY_INFO = {
  companyName: branding.companyName,
  tagline: branding.tagline,
  description: branding.description,
  logoUrl: branding.logoUrl,
  phone: branding.phone,
  contactPhone: branding.contactPhone,
  phoneNumber: branding.phone,
  heroImages: branding.heroImages,
  yearsExperience: branding.yearsExperience,
  eventsPerYear: branding.eventsPerYear,
  address: branding.address,
  email: branding.email,
  currency: "₹",
  currencySymbol: "₹"
};

export const STATIC_REVIEWS = [
  {
    customerName: "John D.",
    eventType: "Wedding",
    comment: "Amazing food quality and great service!"
  },
  {
    customerName: "Sarah S.",
    eventType: "Corporate",
    comment: "The best catering service in town. Highly recommended!"
  },
  {
    customerName: "Mike J.",
    eventType: "Birthday",
    comment: "Great food and fast delivery. Very satisfied!"
  },
  {
    customerName: "Emma W.",
    eventType: "Anniversary",
    comment: "Professional staff and delicious meals. Will order again!"
  }
];
