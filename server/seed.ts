import { connectDB } from "./db";
import { FoodItemModel, CompanyInfoModel } from "@shared/schema";
import type { InsertFoodItem } from "@shared/schema";

async function seed() {
  console.log("Connecting to MongoDB...");
  await connectDB();
  
  console.log("Seeding database...");
  
  // Check if food items already exist
  const existingFoodItems = await FoodItemModel.find();
  
  if (existingFoodItems.length > 0) {
    console.log(`Database already has ${existingFoodItems.length} food items. Skipping seed to preserve data.`);
    console.log("To reseed, delete food items manually first.");
    process.exit(0);
  }
  
  console.log("No food items found. Adding Telangana menu...");
  
  // Check if company info already exists
  const existing = await CompanyInfoModel.findOne();
  
  if (!existing) {
    // Insert default company info
    await CompanyInfoModel.create({
      companyName: "Ravi canteen",
      tagline: "Exceptional Food for Unforgettable Events",
      description: "We specialize in creating memorable culinary experiences for weddings, corporate events, and special occasions. Our team of expert chefs uses only the finest ingredients to craft dishes that delight your guests.",
      email: "info@premiumcatering.com",
      phone: "+91 98765 43210",
      address: "123 MG Road, Mumbai, Maharashtra 400001",
      eventsPerYear: 500,
    });
    console.log("Default company info created");
  } else {
    console.log("Company info already exists");
  }
  
  // Add comprehensive Telangana and South Indian food items
  console.log("Adding Telangana food items...");
  const telanganaFoodItems: InsertFoodItem[] = [
    // Main Rice Dishes (15 items)
    { name: "Hyderabadi Biryani", description: "Signature aromatic rice with mutton/chicken, slow-cooked using dum pukht method", category: "main", imageUrl: null },
    { name: "Kodi Pulao", description: "Chicken pulao with fresh spices - lighter alternative to biryani", category: "main", imageUrl: null },
    { name: "Pulihora", description: "Tangy tamarind rice tempered with mustard seeds, curry leaves, and peanuts", category: "main", imageUrl: null },
    { name: "Kobbari Saddi", description: "Spiced coconut rice, must-have during Bathukamma festival", category: "main", imageUrl: null },
    { name: "Curd Rice", description: "Cooling yogurt rice with tempering and fresh vegetables", category: "main", imageUrl: null },
    { name: "Lemon Rice", description: "Tangy lemon-flavored rice with peanuts and curry leaves", category: "main", imageUrl: null },
    { name: "Vegetable Biryani", description: "Aromatic basmati rice layered with mixed vegetables", category: "main", imageUrl: null },
    { name: "Mutton Biryani", description: "Rich mutton pieces cooked with fragrant basmati rice", category: "main", imageUrl: null },
    { name: "Prawn Biryani", description: "Coastal specialty with succulent prawns and spiced rice", category: "main", imageUrl: null },
    { name: "Egg Biryani", description: "Hard-boiled eggs layered with spiced rice", category: "main", imageUrl: null },
    { name: "Kalyani Biryani", description: "Buffalo meat biryani from Hyderabad", category: "main", imageUrl: null },
    { name: "Paneer Biryani", description: "Cottage cheese cubes in aromatic rice", category: "main", imageUrl: null },
    { name: "Keema Pulao", description: "Minced meat cooked with rice and spices", category: "main", imageUrl: null },
    { name: "Tomato Rice", description: "Tangy tomato-flavored rice with aromatic spices", category: "main", imageUrl: null },
    { name: "Mint Rice", description: "Refreshing rice with fresh mint and coriander", category: "main", imageUrl: null },
    
    // Vegetarian Curries & Sides (25 items)
    { name: "Gutti Vankaya", description: "Stuffed brinjal with peanut-spice masala in tangy tomato gravy", category: "main", imageUrl: null },
    { name: "Mirch Ka Salan", description: "Rich peanut & chilli gravy, traditionally paired with biryani", category: "main", imageUrl: null },
    { name: "Bagar Baigan", description: "Spiced eggplant preparation with aromatic spices", category: "main", imageUrl: null },
    { name: "Dalcha", description: "Lentils cooked with vegetables and aromatic spices", category: "main", imageUrl: null },
    { name: "Bendakaya Fry", description: "Crispy okra stir-fry with spices", category: "main", imageUrl: null },
    { name: "Aloo Gobi", description: "Potato and cauliflower curry", category: "main", imageUrl: null },
    { name: "Palak Paneer", description: "Cottage cheese in creamy spinach gravy", category: "main", imageUrl: null },
    { name: "Paneer Butter Masala", description: "Cottage cheese in rich tomato cream sauce", category: "main", imageUrl: null },
    { name: "Mixed Vegetable Curry", description: "Assorted vegetables in spiced gravy", category: "main", imageUrl: null },
    { name: "Cabbage Poriyal", description: "Dry cabbage stir-fry with coconut", category: "main", imageUrl: null },
    { name: "Beans Poriyal", description: "Green beans with coconut and mustard", category: "main", imageUrl: null },
    { name: "Carrot Poriyal", description: "Shredded carrots with spices and coconut", category: "main", imageUrl: null },
    { name: "Brinjal Curry", description: "Eggplant in tangy tamarind gravy", category: "main", imageUrl: null },
    { name: "Drumstick Curry", description: "Moringa in spiced coconut gravy", category: "main", imageUrl: null },
    { name: "Potato Curry", description: "Spiced potato curry with tomatoes", category: "main", imageUrl: null },
    { name: "Chana Masala", description: "Chickpeas in spicy tomato gravy", category: "main", imageUrl: null },
    { name: "Rajma Masala", description: "Red kidney beans in thick gravy", category: "main", imageUrl: null },
    { name: "Matar Paneer", description: "Green peas and cottage cheese curry", category: "main", imageUrl: null },
    { name: "Mushroom Masala", description: "Button mushrooms in spiced gravy", category: "main", imageUrl: null },
    { name: "Kadai Paneer", description: "Cottage cheese with bell peppers in thick gravy", category: "main", imageUrl: null },
    { name: "Malai Kofta", description: "Fried paneer balls in creamy sauce", category: "main", imageUrl: null },
    { name: "Navratan Korma", description: "Nine vegetable curry in cashew gravy", category: "main", imageUrl: null },
    { name: "Dum Aloo", description: "Baby potatoes in rich Kashmiri gravy", category: "main", imageUrl: null },
    { name: "Bhindi Masala", description: "Okra in onion-tomato gravy", category: "main", imageUrl: null },
    { name: "Jeera Aloo", description: "Cumin-flavored potatoes", category: "main", imageUrl: null },
    
    // Dal & Soups (12 items)
    { name: "Khatti Dal", description: "Tangy toor dal with tamarind & mild spices, everyday staple", category: "main", imageUrl: null },
    { name: "Sambar", description: "Drumstick sambar with mixed vegetables", category: "main", imageUrl: null },
    { name: "Tomato Pappu", description: "Tomato-based lentil soup with traditional tempering", category: "main", imageUrl: null },
    { name: "Dal Tadka", description: "Yellow lentils with ghee tempering", category: "main", imageUrl: null },
    { name: "Dal Fry", description: "Fried lentils with onions and tomatoes", category: "main", imageUrl: null },
    { name: "Dal Makhani", description: "Black lentils in butter and cream", category: "main", imageUrl: null },
    { name: "Rasam", description: "Tangy tamarind soup with spices", category: "main", imageUrl: null },
    { name: "Tomato Rasam", description: "Tomato-based South Indian soup", category: "main", imageUrl: null },
    { name: "Pepper Rasam", description: "Spicy black pepper soup", category: "main", imageUrl: null },
    { name: "Lemon Rasam", description: "Tangy lemon-flavored soup", category: "main", imageUrl: null },
    { name: "Moong Dal", description: "Yellow split lentils curry", category: "main", imageUrl: null },
    { name: "Masoor Dal", description: "Red lentils in mild spiced gravy", category: "main", imageUrl: null },
    
    // Non-Vegetarian (20 items)
    { name: "Gongura Mamsam", description: "Mutton cooked with tangy sorrel leaves - Telangana signature dish", category: "main", imageUrl: null },
    { name: "Talakaya Kura", description: "Traditional fish curry with aromatic spices", category: "main", imageUrl: null },
    { name: "Royyala Kura", description: "Prawn curry with coconut and spices", category: "main", imageUrl: null },
    { name: "Chicken Curry", description: "Classic chicken curry with onion-tomato gravy", category: "main", imageUrl: null },
    { name: "Mutton Curry", description: "Tender mutton in thick spiced gravy", category: "main", imageUrl: null },
    { name: "Fish Fry", description: "Crispy fried fish marinated in spices", category: "main", imageUrl: null },
    { name: "Chicken Fry", description: "Dry chicken fry with pepper and spices", category: "main", imageUrl: null },
    { name: "Mutton Fry", description: "Dry mutton preparation with aromatic spices", category: "main", imageUrl: null },
    { name: "Prawn Fry", description: "Spicy fried prawns", category: "main", imageUrl: null },
    { name: "Chicken 65", description: "Spicy deep-fried chicken chunks", category: "main", imageUrl: null },
    { name: "Pepper Chicken", description: "Black pepper flavored chicken curry", category: "main", imageUrl: null },
    { name: "Chettinad Chicken", description: "Spicy chicken from Chettinad region", category: "main", imageUrl: null },
    { name: "Butter Chicken", description: "Chicken in creamy tomato butter sauce", category: "main", imageUrl: null },
    { name: "Chicken Tikka Masala", description: "Grilled chicken in spiced tomato gravy", category: "main", imageUrl: null },
    { name: "Kadai Chicken", description: "Chicken with bell peppers in thick gravy", category: "main", imageUrl: null },
    { name: "Egg Curry", description: "Hard-boiled eggs in spiced gravy", category: "main", imageUrl: null },
    { name: "Andhra Chicken Curry", description: "Spicy Andhra-style chicken preparation", category: "main", imageUrl: null },
    { name: "Gongura Chicken", description: "Chicken cooked with sorrel leaves", category: "main", imageUrl: null },
    { name: "Mutton Keema", description: "Spiced minced mutton curry", category: "main", imageUrl: null },
    { name: "Mutton Rogan Josh", description: "Aromatic mutton curry with yogurt", category: "main", imageUrl: null },
    
    // Breads & Rotis (18 items)
    { name: "Jonna Rotte", description: "Jowar (sorghum) flatbread - traditional Telangana staple", category: "appetizer", imageUrl: null },
    { name: "Rumali Roti", description: "Thin handkerchief bread, perfect with curries", category: "appetizer", imageUrl: null },
    { name: "Puri", description: "Fried fluffy bread, wedding essential", category: "appetizer", imageUrl: null },
    { name: "Chapati", description: "Whole wheat flatbread", category: "appetizer", imageUrl: null },
    { name: "Phulka", description: "Soft puffed whole wheat roti", category: "appetizer", imageUrl: null },
    { name: "Naan", description: "Leavened flatbread baked in tandoor", category: "appetizer", imageUrl: null },
    { name: "Butter Naan", description: "Naan brushed with butter", category: "appetizer", imageUrl: null },
    { name: "Garlic Naan", description: "Naan topped with garlic", category: "appetizer", imageUrl: null },
    { name: "Kulcha", description: "Stuffed leavened bread", category: "appetizer", imageUrl: null },
    { name: "Paratha", description: "Layered flatbread", category: "appetizer", imageUrl: null },
    { name: "Aloo Paratha", description: "Potato-stuffed flatbread", category: "appetizer", imageUrl: null },
    { name: "Paneer Paratha", description: "Cottage cheese stuffed paratha", category: "appetizer", imageUrl: null },
    { name: "Gobi Paratha", description: "Cauliflower-stuffed flatbread", category: "appetizer", imageUrl: null },
    { name: "Ragi Roti", description: "Finger millet flatbread", category: "appetizer", imageUrl: null },
    { name: "Bajra Roti", description: "Pearl millet flatbread", category: "appetizer", imageUrl: null },
    { name: "Tandoori Roti", description: "Whole wheat bread from tandoor", category: "appetizer", imageUrl: null },
    { name: "Bhatura", description: "Fried leavened bread", category: "appetizer", imageUrl: null },
    { name: "Luchi", description: "Bengali-style fried bread", category: "appetizer", imageUrl: null },
    
    // Chutneys & Pickles (15 items)
    { name: "Gongura Pachadi", description: "Tangy sorrel leaf chutney - signature Telangana item", category: "appetizer", imageUrl: null },
    { name: "Coconut Chutney", description: "Fresh coconut chutney with traditional tempering", category: "appetizer", imageUrl: null },
    { name: "Avakaya", description: "Spicy mango pickle - Andhra/Telangana special", category: "appetizer", imageUrl: null },
    { name: "Tomato Chutney", description: "Spicy tomato chutney with garlic", category: "appetizer", imageUrl: null },
    { name: "Peanut Chutney", description: "Roasted peanut chutney", category: "appetizer", imageUrl: null },
    { name: "Mint Chutney", description: "Fresh mint and coriander chutney", category: "appetizer", imageUrl: null },
    { name: "Tamarind Chutney", description: "Sweet and tangy tamarind sauce", category: "appetizer", imageUrl: null },
    { name: "Onion Chutney", description: "Spicy onion and tomato chutney", category: "appetizer", imageUrl: null },
    { name: "Ginger Chutney", description: "Spicy ginger chutney for pesarattu", category: "appetizer", imageUrl: null },
    { name: "Allam Pachadi", description: "Ginger pickle with tamarind", category: "appetizer", imageUrl: null },
    { name: "Lemon Pickle", description: "Tangy lemon pickle with spices", category: "appetizer", imageUrl: null },
    { name: "Gongura Pickle", description: "Preserved sorrel leaf pickle", category: "appetizer", imageUrl: null },
    { name: "Red Chilli Pickle", description: "Spicy chilli pickle", category: "appetizer", imageUrl: null },
    { name: "Mixed Vegetable Pickle", description: "Assorted vegetables in spiced oil", category: "appetizer", imageUrl: null },
    { name: "Tomato Pickle", description: "Tangy tomato pickle", category: "appetizer", imageUrl: null },
    
    // Sweets & Desserts (25 items)
    { name: "Bobbatlu (Puran Poli)", description: "Sweet flatbread stuffed with chana dal & jaggery - wedding essential", category: "dessert", imageUrl: null },
    { name: "Ariselu", description: "Sweet made with rice flour & jaggery, prepared during festivals", category: "dessert", imageUrl: null },
    { name: "Qubani Ka Meetha", description: "Apricot dessert - Hyderabadi specialty", category: "dessert", imageUrl: null },
    { name: "Pootharekulu", description: "Paper-thin sweet from Atreyapuram, wedding favorite", category: "dessert", imageUrl: null },
    { name: "Gulab Jamun", description: "Fried milk balls in sugar syrup", category: "dessert", imageUrl: null },
    { name: "Semiya Payasam", description: "Vermicelli pudding with nuts and cardamom", category: "dessert", imageUrl: null },
    { name: "Jalebi", description: "Deep-fried pretzel-shaped sweet in sugar syrup", category: "dessert", imageUrl: null },
    { name: "Rasmalai", description: "Cottage cheese dumplings in sweet cream", category: "dessert", imageUrl: null },
    { name: "Kheer", description: "Rice pudding with milk and sugar", category: "dessert", imageUrl: null },
    { name: "Gajar Halwa", description: "Carrot halwa with ghee and nuts", category: "dessert", imageUrl: null },
    { name: "Rava Kesari", description: "Semolina sweet with saffron", category: "dessert", imageUrl: null },
    { name: "Mysore Pak", description: "Ghee-rich sweet from Karnataka", category: "dessert", imageUrl: null },
    { name: "Ladoo", description: "Round sweet balls made with various ingredients", category: "dessert", imageUrl: null },
    { name: "Boondi Ladoo", description: "Sweet made with gram flour pearls", category: "dessert", imageUrl: null },
    { name: "Motichoor Ladoo", description: "Fine gram flour pearls in sweet balls", category: "dessert", imageUrl: null },
    { name: "Coconut Ladoo", description: "Sweet coconut balls", category: "dessert", imageUrl: null },
    { name: "Kaju Katli", description: "Cashew diamond-shaped sweet", category: "dessert", imageUrl: null },
    { name: "Barfi", description: "Milk-based sweet fudge", category: "dessert", imageUrl: null },
    { name: "Peda", description: "Soft milk sweet", category: "dessert", imageUrl: null },
    { name: "Sandesh", description: "Bengali cottage cheese sweet", category: "dessert", imageUrl: null },
    { name: "Payasam", description: "Traditional South Indian pudding", category: "dessert", imageUrl: null },
    { name: "Double Ka Meetha", description: "Bread pudding Hyderabadi style", category: "dessert", imageUrl: null },
    { name: "Shahi Tukda", description: "Fried bread in sweet milk", category: "dessert", imageUrl: null },
    { name: "Rabri", description: "Thickened sweetened milk", category: "dessert", imageUrl: null },
    { name: "Kulfi", description: "Traditional Indian ice cream", category: "dessert", imageUrl: null },
    
    // Tiffin/Breakfast (20 items)
    { name: "Pesarattu", description: "Green gram dosa with ginger chutney - Telangana breakfast special", category: "appetizer", imageUrl: null },
    { name: "Idli-Vada-Sambar", description: "Steamed rice cakes and lentil fritters with sambar", category: "appetizer", imageUrl: null },
    { name: "Upma", description: "Semolina or broken wheat preparation with vegetables", category: "appetizer", imageUrl: null },
    { name: "Masala Dosa", description: "Crispy rice crepe with potato filling", category: "appetizer", imageUrl: null },
    { name: "Plain Dosa", description: "Crispy rice and lentil crepe", category: "appetizer", imageUrl: null },
    { name: "Onion Dosa", description: "Dosa topped with onions", category: "appetizer", imageUrl: null },
    { name: "Rava Dosa", description: "Crispy semolina crepe", category: "appetizer", imageUrl: null },
    { name: "Set Dosa", description: "Thick soft dosas served in sets", category: "appetizer", imageUrl: null },
    { name: "Uttapam", description: "Thick rice pancake with toppings", category: "appetizer", imageUrl: null },
    { name: "Medu Vada", description: "Crispy lentil donuts", category: "appetizer", imageUrl: null },
    { name: "Sambar Vada", description: "Lentil donuts soaked in sambar", category: "appetizer", imageUrl: null },
    { name: "Dahi Vada", description: "Lentil donuts in yogurt", category: "appetizer", imageUrl: null },
    { name: "Poha", description: "Flattened rice with vegetables", category: "appetizer", imageUrl: null },
    { name: "Kanda Poha", description: "Flattened rice with onions", category: "appetizer", imageUrl: null },
    { name: "Pongal", description: "Rice and lentil porridge", category: "appetizer", imageUrl: null },
    { name: "Ven Pongal", description: "Savory rice and lentil dish", category: "appetizer", imageUrl: null },
    { name: "Bisi Bele Bath", description: "Spiced rice and lentil dish", category: "appetizer", imageUrl: null },
    { name: "Rava Upma", description: "Semolina breakfast dish", category: "appetizer", imageUrl: null },
    { name: "Vermicelli Upma", description: "Semolina noodles breakfast", category: "appetizer", imageUrl: null },
    { name: "Appam", description: "Rice pancake with soft center", category: "appetizer", imageUrl: null },
    
    // Beverages (12 items)
    { name: "Chaas (Buttermilk)", description: "Spiced yogurt drink, cooling and refreshing", category: "beverage", imageUrl: null },
    { name: "Filter Coffee", description: "South Indian style filter coffee", category: "beverage", imageUrl: null },
    { name: "Masala Tea", description: "Spiced tea with cardamom and ginger", category: "beverage", imageUrl: null },
    { name: "Sweet Lassi", description: "Sweet yogurt drink", category: "beverage", imageUrl: null },
    { name: "Salt Lassi", description: "Salted yogurt drink", category: "beverage", imageUrl: null },
    { name: "Mango Lassi", description: "Yogurt drink with mango", category: "beverage", imageUrl: null },
    { name: "Badam Milk", description: "Almond flavored milk", category: "beverage", imageUrl: null },
    { name: "Rose Milk", description: "Milk with rose syrup", category: "beverage", imageUrl: null },
    { name: "Jal Jeera", description: "Cumin-flavored cold drink", category: "beverage", imageUrl: null },
    { name: "Lime Soda", description: "Fresh lime with soda water", category: "beverage", imageUrl: null },
    { name: "Coconut Water", description: "Fresh tender coconut water", category: "beverage", imageUrl: null },
    { name: "Sugarcane Juice", description: "Fresh pressed sugarcane juice", category: "beverage", imageUrl: null },
    
    // Snacks & Starters (18 items)
    { name: "Sakinalu", description: "Crispy rice flour & sesame snack for Sankranti", category: "appetizer", imageUrl: null },
    { name: "Mirchi Bajji", description: "Chilli fritters with gram flour batter", category: "appetizer", imageUrl: null },
    { name: "Cut Mirchi", description: "Stuffed chilli fritters", category: "appetizer", imageUrl: null },
    { name: "Onion Pakoda", description: "Crispy onion fritters", category: "appetizer", imageUrl: null },
    { name: "Vegetable Pakoda", description: "Mixed vegetable fritters", category: "appetizer", imageUrl: null },
    { name: "Paneer Pakoda", description: "Cottage cheese fritters", category: "appetizer", imageUrl: null },
    { name: "Samosa", description: "Fried pastry with potato filling", category: "appetizer", imageUrl: null },
    { name: "Kachori", description: "Fried pastry with lentil filling", category: "appetizer", imageUrl: null },
    { name: "Bonda", description: "Potato dumpling fritters", category: "appetizer", imageUrl: null },
    { name: "Aloo Bonda", description: "Spiced potato balls fried in gram flour", category: "appetizer", imageUrl: null },
    { name: "Masala Vada", description: "Spiced lentil fritters", category: "appetizer", imageUrl: null },
    { name: "Papad", description: "Crispy lentil wafers", category: "appetizer", imageUrl: null },
    { name: "Roasted Papad", description: "Flame-roasted lentil wafers", category: "appetizer", imageUrl: null },
    { name: "Fried Papad", description: "Deep-fried crispy wafers", category: "appetizer", imageUrl: null },
    { name: "Banana Bajji", description: "Plantain fritters", category: "appetizer", imageUrl: null },
    { name: "Bread Pakoda", description: "Bread slices fried in gram flour batter", category: "appetizer", imageUrl: null },
    { name: "Paneer Tikka", description: "Grilled cottage cheese cubes", category: "appetizer", imageUrl: null },
    { name: "Chicken Tikka", description: "Grilled marinated chicken pieces", category: "appetizer", imageUrl: null },
  ];

  await FoodItemModel.insertMany(telanganaFoodItems);

  const count = await FoodItemModel.countDocuments();
  console.log(`✓ Added ${count} Telangana food items to database`);
  
  console.log("Database seeded successfully");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
