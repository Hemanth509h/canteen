const nonVegItems = [
  // Chicken Dishes
  { name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken pieces", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Tikka", description: "Marinated chicken chunks grilled in tandoor", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Tandoori Chicken", description: "Classic tandoori spiced whole chicken leg", category: "Starters", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Korma", description: "Mild creamy chicken curry with cashews", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Malai Tikka", description: "Creamy marinated chicken tikka with mild spices", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Chicken 65", description: "Spicy deep fried chicken with curry leaves", category: "Starters", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Lollipop", description: "Fried chicken wings shaped like lollipops", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Chicken Manchurian", description: "Indo-Chinese style chicken in tangy sauce", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Chilli Chicken", description: "Spicy Indo-Chinese chicken with bell peppers", category: "Chinese", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Fried Rice", description: "Wok-tossed rice with chicken and vegetables", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Chicken Hakka Noodles", description: "Stir-fried noodles with chicken and vegetables", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Chicken Momos", description: "Steamed dumplings with spiced chicken filling", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Chicken Spring Roll", description: "Crispy rolls filled with chicken and veggies", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Chicken Schezwan", description: "Spicy schezwan style chicken preparation", category: "Chinese", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Chettinad", description: "Spicy South Indian chicken curry", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Kadai", description: "Chicken cooked with bell peppers in kadai", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Do Pyaza", description: "Chicken curry with double onion preparation", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Hyderabadi", description: "Hyderabadi style spicy chicken curry", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Rezala", description: "Bengali style chicken in white gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Vindaloo", description: "Spicy Goan chicken curry with vinegar", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Xacuti", description: "Goan style coconut chicken curry", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Saagwala", description: "Chicken cooked with spinach gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Achari", description: "Pickled spice flavored chicken curry", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Keema", description: "Minced chicken cooked with aromatic spices", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Kofta Curry", description: "Chicken meatballs in rich gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Shahi", description: "Royal style chicken in creamy cashew gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Nawabi", description: "Mughlai style rich chicken curry", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Handi", description: "Chicken slow-cooked in clay pot", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chicken Jalfrezi", description: "Chicken with mixed vegetables in tangy sauce", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Chicken Rogan Josh", description: "Kashmiri style aromatic chicken curry", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  
  // Mutton/Lamb Dishes
  { name: "Mutton Biryani", description: "Aromatic rice layered with spiced mutton", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Mutton Keema", description: "Spiced minced mutton preparation", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Mutton Kofta Curry", description: "Mutton meatballs in rich tomato gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Mutton Rogan Josh", description: "Kashmiri style aromatic mutton curry", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Mutton Korma", description: "Creamy mutton curry with nuts", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Mutton Do Pyaza", description: "Mutton with double onion preparation", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Mutton Nihari", description: "Slow-cooked mutton shank stew", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Mutton Paya", description: "Spiced mutton trotters curry", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Mutton Haleem", description: "Slow-cooked mutton with wheat", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Mutton Seekh Kebab", description: "Minced mutton skewers grilled in tandoor", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Mutton Shami Kebab", description: "Shallow fried mutton patties with lentils", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Mutton Boti Kebab", description: "Marinated mutton pieces grilled on skewers", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Mutton Galouti Kebab", description: "Melt in mouth minced mutton kebab", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Mutton Chaap", description: "Fried mutton ribs with spices", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Lamb Chops", description: "Grilled lamb chops with herbs and spices", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Lamb Shank", description: "Slow-braised lamb shank in gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Mutton Handi", description: "Clay pot cooked mutton curry", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Mutton Saag", description: "Mutton cooked with spinach", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Bhuna Gosht", description: "Dry roasted mutton with spices", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Keema Matar", description: "Minced mutton with green peas", category: "Main Course", dietaryTags: ["non-veg"] },
  
  // Fish Dishes
  { name: "Fish Curry", description: "Traditional fish curry with coconut", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Fish Tikka", description: "Marinated fish grilled in tandoor", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Fish Amritsari", description: "Crispy batter fried fish Amritsar style", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Fish Koliwada", description: "Mumbai style spicy fried fish", category: "Starters", dietaryTags: ["non-veg", "spicy"] },
  { name: "Tandoori Fish", description: "Whole fish marinated and grilled", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Fish Fingers", description: "Crispy breaded fish strips", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Fish Molee", description: "Kerala style fish in coconut milk", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Fish Mappas", description: "Malabar style fish coconut curry", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Fish Pollichathu", description: "Kerala style fish wrapped in banana leaf", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Goan Fish Curry", description: "Tangy coconut based Goan fish curry", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Bengali Fish Curry", description: "Mustard flavored Bengali fish curry", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Fish Biryani", description: "Fragrant rice with spiced fish pieces", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Fish Fry Masala", description: "Pan-fried fish with Indian spices", category: "Starters", dietaryTags: ["non-veg", "spicy"] },
  { name: "Pomfret Fry", description: "Whole pomfret fish shallow fried", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Surmai Fry", description: "King fish fry with coastal spices", category: "Starters", dietaryTags: ["non-veg"] },
  
  // Prawn/Seafood Dishes
  { name: "Prawn Biryani", description: "Fragrant rice with spiced prawns", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Prawn Curry", description: "Prawns in spicy coconut gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Prawn Fry", description: "Crispy fried prawns with spices", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Prawn Koliwada", description: "Spicy batter fried prawns", category: "Starters", dietaryTags: ["non-veg", "spicy"] },
  { name: "Tandoori Prawns", description: "Prawns marinated and grilled", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Prawn Malai Curry", description: "Prawns in creamy coconut gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Chilli Prawns", description: "Spicy Indo-Chinese prawns", category: "Chinese", dietaryTags: ["non-veg", "spicy"] },
  { name: "Prawn Manchurian", description: "Prawns in tangy Manchurian sauce", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Prawn Fried Rice", description: "Wok-tossed rice with prawns", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Prawn Noodles", description: "Stir-fried noodles with prawns", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Crab Masala", description: "Spicy crab curry with masala", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Crab Fry", description: "Dry fried crab with spices", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Squid Fry", description: "Crispy fried calamari rings", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Squid Masala", description: "Squid cooked in spicy masala", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Lobster Curry", description: "Lobster in rich coconut curry", category: "Main Course", dietaryTags: ["non-veg"] },
  
  // Egg Dishes
  { name: "Egg Curry", description: "Boiled eggs in spicy onion gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Egg Biryani", description: "Fragrant rice with boiled eggs", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Egg Bhurji", description: "Spiced scrambled eggs Indian style", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Egg Masala", description: "Eggs in rich masala gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Egg Roast", description: "Kerala style egg roast", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Egg Fried Rice", description: "Wok-tossed rice with scrambled eggs", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Egg Noodles", description: "Stir-fried noodles with eggs", category: "Chinese", dietaryTags: ["non-veg"] },
  { name: "Egg Paratha", description: "Flatbread stuffed with spiced egg", category: "Breads", dietaryTags: ["non-veg"] },
  
  // Other Non-Veg
  { name: "Duck Roast", description: "Kerala style spicy duck roast", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Duck Curry", description: "Duck cooked in aromatic curry", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Duck Mappas", description: "Duck in coconut milk gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Quail Fry", description: "Crispy fried quail with spices", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Quail Roast", description: "Roasted quail with Kerala spices", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Pork Vindaloo", description: "Spicy Goan pork with vinegar", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Pork Sorpotel", description: "Goan style spiced pork curry", category: "Main Course", dietaryTags: ["non-veg", "spicy"] },
  { name: "Pork Fry", description: "Dry fried pork with spices", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Pork Ribs BBQ", description: "Grilled spiced pork ribs", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Pork Curry", description: "Pork in coconut gravy", category: "Main Course", dietaryTags: ["non-veg"] },
  { name: "Keema Samosa", description: "Crispy samosa with minced meat", category: "Starters", dietaryTags: ["non-veg"] },
  { name: "Keema Paratha", description: "Flatbread stuffed with minced meat", category: "Breads", dietaryTags: ["non-veg"] },
  { name: "Keema Naan", description: "Naan stuffed with spiced keema", category: "Breads", dietaryTags: ["non-veg"] },
  { name: "Chicken Tikka Biryani", description: "Biryani with grilled chicken tikka", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Hyderabadi Dum Biryani", description: "Slow-cooked layered chicken biryani", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Lucknowi Biryani", description: "Awadhi style fragrant chicken biryani", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Kolkata Biryani", description: "Kolkata style biryani with potato and egg", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Thalassery Biryani", description: "Kerala style chicken biryani", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Ambur Biryani", description: "Tamil Nadu style chicken biryani", category: "Biryani", dietaryTags: ["non-veg"] },
  { name: "Dindigul Biryani", description: "Spicy Tamil Nadu biryani", category: "Biryani", dietaryTags: ["non-veg", "spicy"] },
];

async function seedNonVegItems() {
  console.log(`Seeding ${nonVegItems.length} non-veg items...`);
  let success = 0;
  let failed = 0;
  
  for (const item of nonVegItems) {
    try {
      const response = await fetch('http://localhost:5000/api/food-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (response.ok) {
        success++;
      } else {
        failed++;
        console.error(`Failed: ${item.name}`);
      }
    } catch (error) {
      failed++;
      console.error(`Error: ${item.name}`, error);
    }
  }
  
  console.log(`Done! Success: ${success}, Failed: ${failed}`);
}

seedNonVegItems();
