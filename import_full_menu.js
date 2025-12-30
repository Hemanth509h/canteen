import mongoose from 'mongoose';

const FoodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['Veg', 'Non-Veg'], required: true },
  imageUrl: { type: String, required: true },
  dietaryTags: [String],
  price: Number
}, { timestamps: true, strict: false });

const FoodItem = mongoose.models.fooditems || mongoose.model('fooditems', FoodItemSchema);

const menuData = [
  { "type": "Veg", "category": "Welcome Drinks", "items": ["Fruit Punch", "Coconut Delight", "Badam Milk Hot/Cool", "Orange Juice", "Apple Juice", "Grape Juice", "Pineapple Juice", "Watermelon Juice", "Guava Juice", "Sugarcane", "Mango Milk Shake", "Sapota Milk Shake", "Lyches Milk Shake", "Strawberry Milk Shake", "Vanilla Milk Shake"] },
  { "type": "Veg", "category": "Veg Soup", "items": ["Sweat Corn", "Veg Clear Soup", "Tomato Soup", "Hot & Sour Soup", "Veg Manchow Soup"] },
  { "type": "Veg", "category": "HOTS", "items": ["Mirchi Bajji", "Onion Bajji/Pakodi", "Aloo Balji", "Vankurya Bajji", "Aratikaya Bajji", "Capsicum Bajji", "Bread Bajji", "Pan Bajji", "Out Mirchi", "Corn Vada", "Minapa Garelu"] },
  { "type": "Veg", "category": "Veg Starters", "items": ["Paneer Tikka", "Finger Paneer", "Paneer 65", "Chilli Paneer (Dry)", "Hara Bhara Kabab", "Veg Seekh Kebab", "Beetroot Kebab", "Stuffed Mushrooms", "Dahi Ke Kebab", "Aloo Tikki", "Samosa-Corn/Onion", "Spring Rolls", "Palak Cheese Rolls", "Shanghai Roll", "Com Cheese Nuggets", "Chilly Mushroom", "Veg Cutles", "Com Cheese Ba", "Gobi 65", "Veg Manchuria", "Baby Com Manthurian", "Crispy Corn", "Tandoori Broccoll", "Mushroom Tika", "Tandoori Seys Chitop", "Vegetable Testipurs", "Haney Chilli Putztoes"] },
  { "type": "Veg", "category": "ROTIS", "items": ["Chapati/Phulka", "Tandoori Ruti", "Rumali Roti", "Butter Naan", "Garlic Haan", "Dii Naan", "Baby Naam", "Masala Kulcha", "Pearl", "Masala Vada", "Palak Poori", "Methi PooriDhahi Vada", "Bobbarie Vada", "OM", "Aloo Parathe"] },
  { "type": "Veg", "category": "Indian Curries", "items": ["Paneer Rutter Masala", "Pulak Paneer", "Shahi Paneer", "Kadai Paneer", "Mushroom Paneer", "Gongoora Paneer", "Baby Corn Paneer", "Mushroom Kurma", "Paneer Capsicum Kurma", "Aloo Capsicum Kurma", "Thotakura Liver Kurma", "Capsicum Kaju Kurma", "Baby Corn Kaju Kurma", "Poolmakhan Capsicum Kurma", "Mixed Veg Kurma", "Aloo Capsicum Kurma", "Methi Chaman", "Chana Masala (Dhole)", "Rajma Masala", "Aloo Gobi Masala"] },
  { "type": "Veg", "category": "Special Rice Items", "items": ["Chintha Pandu Pulihora", "Mango Pulihora", "Lemon Pullhora", "Coconut Rice", "Gongoora Kaju Rice", "Pudina Rice", "Karivepak Rice", "Kothimeers Rice", "Tomato Rice", "Ghee Karam Podi Rice", "Nuvvula Rice", "Milmaker Rice", "Jeera Rice", "Vegetable Fried Rice", "Corn Methi Rice", "Sambar Rice"] },
  { "type": "Veg", "category": "Special Gravy Curries", "items": ["Gutthi Vankaya", "Gutthi Dondakaya", "Vankaya Green Place", "Pesara Punugulu Curry", "Milmakker Curry", "Chikkudu Kaya Tomato Curry", "Vellulli Kaju Curry", "Kandha Buchall", "Beers Kaya Shanagapappo Curry", "Aratikaya Masala Curry", "Gokaarya Thmato Curry", "Mango Madras Onlon Curry", "Drumstick Curry", "Gangoora Milmakar", "Gongoora Mushroom Curry", "Gabi Tomato Curry", "Gobi Tomato Curry", "Thati Munjala Curry", "Batthaya Thonals Curry", "Malai Kofta", "Vankaya Orsen Plece Curry", "Stuffed Vankaya", "Vankaya Alon Curry", "Shindi Masala Curry", "Lauki (Bottle gourd) Curry", "Drumstick (Munalikada) Curry", "Kadal Veg", "Vankaya Mango Curry", "Vankaya Milmaker Curry", "Vankaya Kaju Curry", "Vankaya Drumstick Curry", "Aloo Tontate Curry", "Drumstick Bhendi Kaju Curry", "Drumstici Kaju Curry", "Drumstick Milmaker Curry", "Beerakays Curry", "Beerakaya Alasandala Curry", "Beerakaya Tomato Carry", "Sorakaye Masala Curry", "Sorakaya Perugu Curry"] },
  { "type": "Veg", "category": "Roti Chutney's", "items": ["Beerakaya Tornato Chutney", "Kathimeera Tomato Chutney", "Jamakaya Chutney", "Cabbage Chutney", "Nuvvula Chutnay", "Gangoora Chutney", "Kobbari Mamidikaya Thurumu Chutney", "Kobberi Chintakaya Chutney", "Palli Tomato Chutney", "Allam Chutney", "Dandakaya Mukkala Chutney", "Dosakaya Mukkala Chutney"] },
  { "type": "Veg", "category": "Curds", "items": ["Bucket Curd", "Pot Card", "Raithe"] },
  { "type": "Veg", "category": "Avakayalu", "items": ["Veilulil Kaju Avakaya", "Larmon Avakarya", "Dosa Avskaya", "Mixed Veg Avahaya", "Madras Onion Avskaya", "Usiri Avakaya", "Gongoora Avakaya", "Vankaya Avakaye", "Munalikada Avalkaya", "Mamid kaya Avakaya", "Thushks Avakayn", "Grape Avakaya", "Gral Avskaya"] },
  { "type": "Veg", "category": "Podilu", "items": ["Kandhi Podl", "Kobberri Shanaga Karam", "Huvvula Karam", "Karlvepak Karsin", "Pelli Karem"] },
  { "type": "Veg", "category": "Chinese", "items": ["Salt Noodles", "o Noodles", "A-The Neoclles", "Hoedles"] },
  { "type": "Veg", "category": "Papad's", "items": ["Appadallu", "Saggu Blyam Vallyulu", "Minapa Vedlyata", "Challa Mirchil"] },
  { "type": "Veg", "category": "Salad's", "items": ["Green Salad", "Sprouts", "Hunian Salad", "Penidi Chat", "Aloo Chans Saled"] },
  { "type": "Veg", "category": "Chat Items", "items": ["Pani Poort", "Aloo Ragade", "Rajasthani Kochorn", "Samosa Ragada", "Dhahi Poorl", "Ragada Kachori", "Bhel poori", "Aloo Tiki", "Laccha Katlet"] },
  { "type": "Veg", "category": "Mocktails", "items": ["Virgin mojito", "Blue Lagoun", "Jeers Cordial", "Pina Colada", "Streudiery Punch"] },
  { "type": "Veg", "category": "American Chopes", "items": ["Aloo Manchuria", "Gobi Manchuria", "Veg Manchuria", "Mushroom Manchuria", "Baby Corn Manchuria", "Paneer Manchuria", "Scherwan Fried Rice", "Water Melon", "Guave Crush"] },
  { "type": "Veg", "category": "Italian Snacks", "items": ["Pizza", "Mini Pizza", "Garlic Bread", "Mini Burger", "Pasta (Red & White)", "Italian Stuffed floll", "Thin Crust Pizza", "Grilled Pizza", "Pizza Bums"] },
  { "type": "Veg", "category": "South Indian Tiffin's", "items": ["Idly", "Varda", "Thatta Idly", "Mysore Bal", "Tomato Bath", "Pongal", "Dosa-All Veritas", "Pesarattu", "Poorl", "Kabbari Chutney", "Paill Putnala Chutney"] },
  { "type": "Veg", "category": "Ice Creams", "items": ["Vanilia", "Straw Berry", "Butter Scotch", "Caramel nuts", "Pistha", "Tooty Frulty", "Guava", "Honay Moon Delight", "Seetha Phai", "Mango", "Anjeer Badham", "Chocolate", "Orange", "Kutfl", "Badam Kulfi", "Black Current"] },
  { "type": "Veg", "category": "Veg Biryani's", "items": ["Vegetable Dum Biryani", "Hyderabadi Veg Dum Biryani", "Andhrs Veg Biryani", "Paneer Biryani", "Mushroom Dum Biryani", "Mushroom-Peas Biryani", "Vankaya Dum Biryani", "Penasakaya Dum Biryani", "Panasakaya Pulso", "Chitti Muthyalu Paneer Pulao", "Chitti Muthyalu Mushroom Pulao", "Paneer Raju Pulao", "Gongoora Kaju Dum Biryani", "Begara Rice", "Plain Biryani", "Pendalem Manga Curry"] },
  { "type": "Veg", "category": "Veg Fry Items", "items": ["Bendi Kaju Fry", "Dondakaya Pakodi Fry", "Aloo Green Place Fry", "Aloo Beans Carrot Fry", "Beans Carrot Dum Fry", "Vankaya Pakodi Fry", "Aloo 65", "Milmaker Beerakaye Pry", "Kandha Pry", "Panasa Pottu Pry", "Musltroam Fry", "Aretikaye Allam Fry", "Thotakurs Liver Fry", "Capsicum Polkod", "Chamag adda Finger Chi", "Gobl 65", "Cabbage 45", "Cabbage Shanaga Pappu Duin Try", "Chikudu Kays Durs Fry", "Albo Poosa Fry", "Kandha Pooss Fry", "Kakara Kaya Fry"] },
  { "type": "Veg", "category": "Dal Items", "items": ["Dosakaya Pappu", "Tomato Pappu", "Mango Paspu", "Palskura Pappu", "Palakura Mango Pappu", "Gangavelli Manga Pappu", "Thotakura Pappu", "Miami Inaf Pampu", "Gongoora Pappu", "Deerakoys Papp", "Vankays Papou", "Chinthakaye Pappu", "Avskaya Pappu", "Modilha Pappu", "Tomato Pesara Pappu"] },
  { "type": "Veg", "category": "Liquid Items", "items": ["Sambar", "Pappu Chani", "Pesars Papou Charu", "Tomato Rasam", "Miriyala Racam", "Arattkaya Pulusu", "GummadiKaya Palamu", "Ulmacharu cream", "Dhappalem", "Menthe Mal", "Pachi Pulusu"] },
  { "type": "Non-Veg", "category": "Mutton Snacks", "items": ["Mutton Keerna Balls", "Patthar ka Gosh", "Nalgonda Mutton", "Mutton Sheek Kabab", "Mutton Shikampuri", "Mutton Haleem Shots", "Mutton Ghee Roast", "Kamju Pitta Fry/Tikka/guru", "Natulodi Pulao", "Donne Biryani"] }
];

const defaultImageUrl = "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=1000";

async function run() {
  try {
    const mongoUri = "mongodb+srv://phemanthkumar746:htnameh509h@data.psr09.mongodb.net/canteen?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('Clearing fooditems collection...');
    await FoodItem.deleteMany({});
    console.log('Collection cleared.');

    let count = 0;
    for (const section of menuData) {
      for (const itemName of section.items) {
        await FoodItem.create({
          name: itemName,
          description: `${itemName} from ${section.category}`,
          type: section.type,
          category: section.category,
          imageUrl: defaultImageUrl
        });
        count++;
      }
    }

    console.log(`Import completed: ${count} items added.`);
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

run();
