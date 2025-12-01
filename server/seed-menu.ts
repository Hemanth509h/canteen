import mongoose from "mongoose";
import { FoodItemModel } from "./storage";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/canteen";

const menuItems = [
  // Welcome Drinks
  { name: "Fruit Punch", description: "Refreshing fruit punch beverage", category: "Welcome Drinks", dietaryTags: ["vegetarian"] },
  { name: "Coconut Delight", description: "Creamy coconut drink", category: "Welcome Drinks", dietaryTags: ["vegetarian"] },
  { name: "Badam Milk Hot/Cool", description: "Traditional almond milk beverage", category: "Welcome Drinks", dietaryTags: ["vegetarian"] },
  { name: "Orange Juice", description: "Fresh orange juice", category: "Welcome Drinks", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Apple Juice", description: "Fresh apple juice", category: "Welcome Drinks", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Grape Juice", description: "Fresh grape juice", category: "Welcome Drinks", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Pineapple Juice", description: "Fresh pineapple juice", category: "Welcome Drinks", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Watermelon Juice", description: "Fresh watermelon juice", category: "Welcome Drinks", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Guava Juice", description: "Fresh guava juice", category: "Welcome Drinks", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Sugarcane", description: "Fresh sugarcane juice", category: "Welcome Drinks", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Mango Milk Shake", description: "Creamy mango milkshake", category: "Welcome Drinks", dietaryTags: ["vegetarian"] },
  { name: "Sapota Milk Shake", description: "Creamy sapota milkshake", category: "Welcome Drinks", dietaryTags: ["vegetarian"] },
  { name: "Lychee Milk Shake", description: "Creamy lychee milkshake", category: "Welcome Drinks", dietaryTags: ["vegetarian"] },
  { name: "Strawberry Milk Shake", description: "Creamy strawberry milkshake", category: "Welcome Drinks", dietaryTags: ["vegetarian"] },
  { name: "Vanilla Milk Shake", description: "Classic vanilla milkshake", category: "Welcome Drinks", dietaryTags: ["vegetarian"] },

  // Veg Soup
  { name: "Sweet Corn Soup", description: "Creamy sweet corn soup", category: "Veg Soup", dietaryTags: ["vegetarian"] },
  { name: "Veg Clear Soup", description: "Light vegetable clear soup", category: "Veg Soup", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Tomato Soup", description: "Classic tomato soup", category: "Veg Soup", dietaryTags: ["vegetarian"] },
  { name: "Hot & Sour Soup", description: "Spicy hot and sour soup", category: "Veg Soup", dietaryTags: ["vegetarian"] },
  { name: "Veg Manchow Soup", description: "Indo-Chinese manchow soup", category: "Veg Soup", dietaryTags: ["vegetarian"] },

  // Hots (Bajji/Pakodi)
  { name: "Mirchi Bajji", description: "Spicy chilli fritters", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Onion Bajji/Pakodi", description: "Crispy onion fritters", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Aloo Bajji", description: "Potato fritters", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Bajji", description: "Brinjal fritters", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Aratikaya Bajji", description: "Raw banana fritters", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Capsicum Bajji", description: "Bell pepper fritters", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Bread Bajji", description: "Bread fritters", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Pan Bajji", description: "Pan fried fritters", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Cut Mirchi", description: "Cut chilli snack", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Masala Vada", description: "Spiced lentil fritters", category: "Hots", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Corn Vada", description: "Corn fritters", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Minapa Garelu", description: "Traditional urad dal vada", category: "Hots", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Dhahi Vada", description: "Vada in yogurt", category: "Hots", dietaryTags: ["vegetarian"] },
  { name: "Bobbarla Vada", description: "Black eyed pea vada", category: "Hots", dietaryTags: ["vegetarian", "vegan"] },

  // Veg Starters
  { name: "Paneer Tikka", description: "Grilled cottage cheese tikka", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Finger Paneer", description: "Crispy paneer fingers", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Paneer 65", description: "Spicy fried paneer", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Chilli Paneer (Dry)", description: "Indo-Chinese chilli paneer", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Hara Bhara Kabab", description: "Green vegetable kababs", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Veg Seekh Kebab", description: "Vegetable seekh kebabs", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Beetroot Kebab", description: "Beetroot kebabs", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Stuffed Mushrooms", description: "Cheese stuffed mushrooms", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Dahi Ke Kebab", description: "Yogurt based kebabs", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Aloo Tikki", description: "Potato patties", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Samosa - Corn/Onion", description: "Crispy samosas with corn or onion filling", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Spring Rolls", description: "Crispy vegetable spring rolls", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Palak Cheese Rolls", description: "Spinach and cheese rolls", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Shanghai Roll", description: "Chinese style rolls", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Corn Cheese Nuggets", description: "Corn and cheese nuggets", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Chilly Mushroom", description: "Spicy mushroom starter", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Veg Cutlet", description: "Mixed vegetable cutlets", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Corn Cheese Balls", description: "Crispy corn cheese balls", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Gobi 65", description: "Spicy fried cauliflower", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Veg Manchuria", description: "Vegetable manchurian", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Baby Corn Manchurian", description: "Baby corn manchurian", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Crispy Corn", description: "Crispy fried corn", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Tandoori Broccoli", description: "Grilled broccoli", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Mushroom Tikka", description: "Grilled mushroom tikka", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Tandoori Soya Chaap", description: "Grilled soya chaap", category: "Veg Starters", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Vegetable Tempura", description: "Japanese style tempura", category: "Veg Starters", dietaryTags: ["vegetarian"] },
  { name: "Honey Chilli Potatoes", description: "Sweet and spicy potatoes", category: "Veg Starters", dietaryTags: ["vegetarian"] },

  // Rotis
  { name: "Chapati / Phulka", description: "Indian whole wheat bread", category: "Rotis", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Tandoori Roti", description: "Tandoor baked bread", category: "Rotis", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Rumali Roti", description: "Thin handkerchief bread", category: "Rotis", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Butter Naan", description: "Butter topped naan", category: "Rotis", dietaryTags: ["vegetarian"] },
  { name: "Garlic Naan", description: "Garlic flavored naan", category: "Rotis", dietaryTags: ["vegetarian"] },
  { name: "Dil Naan", description: "Heart shaped naan", category: "Rotis", dietaryTags: ["vegetarian"] },
  { name: "Baby Naan", description: "Mini naan bread", category: "Rotis", dietaryTags: ["vegetarian"] },
  { name: "Masala Kulcha", description: "Spiced stuffed bread", category: "Rotis", dietaryTags: ["vegetarian"] },
  { name: "Poori", description: "Deep fried puffed bread", category: "Rotis", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Palak Poori", description: "Spinach puffed bread", category: "Rotis", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Methi Poori", description: "Fenugreek puffed bread", category: "Rotis", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Aloo Paratha", description: "Potato stuffed flatbread", category: "Rotis", dietaryTags: ["vegetarian"] },

  // Indian Curries
  { name: "Paneer Butter Masala", description: "Creamy paneer in tomato gravy", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Palak Paneer", description: "Cottage cheese in spinach gravy", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Shahi Paneer", description: "Rich royal paneer curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Kadai Paneer", description: "Paneer in kadai style gravy", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Mushroom Paneer", description: "Paneer and mushroom curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Gongoora Paneer", description: "Paneer in sorrel leaves gravy", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Baby Corn Paneer", description: "Baby corn and paneer curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Mushroom Kurma", description: "Mushroom in creamy gravy", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Paneer Capsicum Kurma", description: "Paneer and capsicum curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Aloo Capsicum Kurma", description: "Potato and capsicum curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Thotakura Liver Kurma", description: "Amaranth leaves curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Capsicum Kaju Kurma", description: "Capsicum cashew curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Baby Corn Kaju Kurma", description: "Baby corn cashew curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Poolmakhan Capsicum Kurma", description: "Lotus seeds capsicum curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Mixed Veg Kurma", description: "Mixed vegetable curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Aloo Capsicum Kurma", description: "Potato capsicum curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Methi Chaman", description: "Fenugreek paneer curry", category: "Indian Curries", dietaryTags: ["vegetarian"] },
  { name: "Chana Masala (Chole)", description: "Spiced chickpea curry", category: "Indian Curries", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Rajma Masala", description: "Kidney beans curry", category: "Indian Curries", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Aloo Gobi Masala", description: "Potato cauliflower curry", category: "Indian Curries", dietaryTags: ["vegetarian", "vegan"] },

  // Special Gravy Curries
  { name: "Gutthi Vankaya", description: "Stuffed brinjal curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Gutthi Dondakaya", description: "Stuffed ivy gourd curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Green Piece", description: "Brinjal green piece curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Pesara Punugulu Curry", description: "Green gram dumpling curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Milmaker Curry", description: "Traditional milk based curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Chikkudu Kaya Tomato Curry", description: "Broad beans tomato curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Vellulli Kaju Curry", description: "Garlic cashew curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Kandha Bachali", description: "Onion bachali curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Beers Kaya Shanagapappu Curry", description: "Ash gourd peanut curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Aratikaya Masala Curry", description: "Raw banana masala curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Gokaarya Tomato Curry", description: "Cluster beans tomato curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Mango Madras Onion Curry", description: "Mango onion curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Drumstick Curry", description: "Drumstick vegetable curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Gongoora Milmaker", description: "Sorrel milk curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Gongoora Mushroom Curry", description: "Sorrel mushroom curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Gobi Tomato Curry", description: "Cauliflower tomato curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Thati Munjala Curry", description: "Palm sprout curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Batthaya Thonala Curry", description: "Traditional thonala curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Malai Kofta", description: "Creamy vegetable dumplings", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Green Piece Curry", description: "Brinjal green curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Stuffed Vankaya", description: "Stuffed brinjal", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Aloo Curry", description: "Brinjal potato curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Bhindi Masala Curry", description: "Okra masala curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Lauki (Bottle gourd) Curry", description: "Bottle gourd curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Drumstick (Munakkada) Curry", description: "Drumstick curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Kadal Veg", description: "Sea vegetable curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Mango Curry", description: "Brinjal mango curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Milmaker Curry", description: "Brinjal milk curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Kaju Curry", description: "Brinjal cashew curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Drumstick Curry", description: "Brinjal drumstick curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Aloo Tomato Curry", description: "Potato tomato curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Drumstick Bhendi Kaju Curry", description: "Drumstick okra cashew curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Drumstick Kaju Curry", description: "Drumstick cashew curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Drumstick Milmaker Curry", description: "Drumstick milk curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Beerakaya Curry", description: "Ridge gourd curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Beerakaya Alasandala Curry", description: "Ridge gourd black eyed pea curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Beerakaya Tomato Curry", description: "Ridge gourd tomato curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Sorakaya Masala Curry", description: "Bottle gourd masala curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Sorakaya Perugu Curry", description: "Bottle gourd yogurt curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },
  { name: "Pendalam Mango Curry", description: "Pendalam mango curry", category: "Special Gravy Curries", dietaryTags: ["vegetarian"] },

  // Special Rice Items
  { name: "Chintha Pandu Pulihora", description: "Tamarind rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Mango Pulihora", description: "Raw mango rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Lemon Pulihora", description: "Lemon rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Coconut Rice", description: "Coconut flavored rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Gongoora Kaju Rice", description: "Sorrel cashew rice", category: "Special Rice Items", dietaryTags: ["vegetarian"] },
  { name: "Pudina Rice", description: "Mint flavored rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Karivepak Rice", description: "Curry leaves rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Kothimeera Rice", description: "Coriander rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Tomato Rice", description: "Tomato flavored rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Ghee Karam Podi Rice", description: "Ghee spice powder rice", category: "Special Rice Items", dietaryTags: ["vegetarian"] },
  { name: "Nuvvula Rice", description: "Sesame rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Milmaker Rice", description: "Milk based rice", category: "Special Rice Items", dietaryTags: ["vegetarian"] },
  { name: "Vegetable Fried Rice", description: "Mixed vegetable fried rice", category: "Special Rice Items", dietaryTags: ["vegetarian"] },
  { name: "Jeera Rice", description: "Cumin flavored rice", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Corn Methi Rice", description: "Corn fenugreek rice", category: "Special Rice Items", dietaryTags: ["vegetarian"] },
  { name: "Sambar Rice", description: "Rice with sambar", category: "Special Rice Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Avakaya Muddha Pappu Rice", description: "Pickle dal rice", category: "Special Rice Items", dietaryTags: ["vegetarian"] },
  { name: "Curd Rice", description: "Yogurt rice", category: "Special Rice Items", dietaryTags: ["vegetarian"] },
  { name: "Bisibella Bath", description: "Karnataka style spiced rice", category: "Special Rice Items", dietaryTags: ["vegetarian"] },

  // Roti Chutneys
  { name: "Beerakaya Tomato Chutney", description: "Ridge gourd tomato chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Kothimeera Tomato Chutney", description: "Coriander tomato chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Jamakaya Chutney", description: "Guava chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Cabbage Chutney", description: "Cabbage chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Nuvvula Chutney", description: "Sesame chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Gongoora Chutney", description: "Sorrel leaves chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Kobbari Mamidikaya Thurumu Chutney", description: "Coconut raw mango chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Kobbari Chintakaya Chutney", description: "Coconut tamarind chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Palli Tomato Chutney", description: "Peanut tomato chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Allam Chutney", description: "Ginger chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Dondakaya Mukkala Chutney", description: "Ivy gourd pieces chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Dosakaya Mukkala Chutney", description: "Yellow cucumber chutney", category: "Roti Chutneys", dietaryTags: ["vegetarian", "vegan"] },

  // Curds
  { name: "Bucket Curd", description: "Fresh bucket curd", category: "Curds", dietaryTags: ["vegetarian"] },
  { name: "Pot Curd", description: "Traditional pot curd", category: "Curds", dietaryTags: ["vegetarian"] },
  { name: "Raitha", description: "Yogurt with vegetables", category: "Curds", dietaryTags: ["vegetarian"] },

  // Papads
  { name: "Appadallu", description: "Traditional papads", category: "Papads", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Fryms", description: "Crispy fryms", category: "Papads", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Saggu Biyam Vadiyalu", description: "Sago wafers", category: "Papads", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Minapa Vadiyalu", description: "Urad dal wafers", category: "Papads", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Challa Mirchi", description: "Buttermilk chilies", category: "Papads", dietaryTags: ["vegetarian"] },

  // Avakayalu (Pickles)
  { name: "Vellulli Kaju Avakaya", description: "Garlic cashew pickle", category: "Avakayalu", dietaryTags: ["vegetarian"] },
  { name: "Lemon Avakaya", description: "Lemon pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Dosa Avakaya", description: "Dosa pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Mixed Veg Avakaya", description: "Mixed vegetable pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Madras Onion Avakaya", description: "Madras onion pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Usiri Avakaya", description: "Gooseberry pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Gongoora Avakaya", description: "Sorrel leaves pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Vankaya Avakaya", description: "Brinjal pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Munakkada Avakaya", description: "Drumstick pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Mamidikaya Avakaya", description: "Raw mango pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Thunaka Avakaya", description: "Thunaka pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Gongura Avakaya", description: "Gongura pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Goru Avakaya", description: "Goru pickle", category: "Avakayalu", dietaryTags: ["vegetarian", "vegan"] },

  // Podilu (Spice Powders)
  { name: "Kandhi Podi", description: "Toor dal powder", category: "Podilu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Kobbari Shanaga Karam", description: "Coconut peanut spice powder", category: "Podilu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Nuvvula Karam", description: "Sesame spice powder", category: "Podilu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Karivepak Karam", description: "Curry leaves spice powder", category: "Podilu", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Palli Karam", description: "Peanut spice powder", category: "Podilu", dietaryTags: ["vegetarian", "vegan"] },

  // Salads
  { name: "Green Salad", description: "Fresh green vegetable salad", category: "Salads", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Sprouts", description: "Healthy sprouts salad", category: "Salads", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Russian Salad", description: "Mixed vegetable Russian salad", category: "Salads", dietaryTags: ["vegetarian"] },
  { name: "Papidi Chat", description: "Crispy papidi chat salad", category: "Salads", dietaryTags: ["vegetarian"] },
  { name: "Aloo Chana Salad", description: "Potato chickpea salad", category: "Salads", dietaryTags: ["vegetarian", "vegan"] },

  // Chat Items
  { name: "Pani Poori", description: "Crispy puris with spiced water", category: "Chat Items", dietaryTags: ["vegetarian"] },
  { name: "Aloo Ragada", description: "Potato with spiced peas", category: "Chat Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Rajasthani Kachori", description: "Rajasthani style kachori", category: "Chat Items", dietaryTags: ["vegetarian"] },
  { name: "Samosa Ragada", description: "Samosa with spiced peas", category: "Chat Items", dietaryTags: ["vegetarian"] },
  { name: "Dhahi Poori", description: "Poori with yogurt", category: "Chat Items", dietaryTags: ["vegetarian"] },
  { name: "Ragada Kachori", description: "Kachori with ragada", category: "Chat Items", dietaryTags: ["vegetarian"] },
  { name: "Bhel Poori", description: "Puffed rice snack", category: "Chat Items", dietaryTags: ["vegetarian"] },
  { name: "Aloo Tikka", description: "Spiced potato patties", category: "Chat Items", dietaryTags: ["vegetarian"] },
  { name: "Lascha Kablet", description: "Lascha style kablet", category: "Chat Items", dietaryTags: ["vegetarian"] },

  // Chinese
  { name: "Veg Soft Noodles", description: "Soft vegetable noodles", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Singapore Noodles", description: "Singapore style noodles", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Thai Noodles", description: "Thai style noodles", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Schezwan Noodles", description: "Spicy Schezwan noodles", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "American Chopes", description: "American style chopes", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Aloo Manchuria", description: "Potato manchurian", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Gobi Manchuria", description: "Cauliflower manchurian", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Veg Manchuria", description: "Mixed vegetable manchurian", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Mushroom Manchuria", description: "Mushroom manchurian", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Baby Corn Manchuria", description: "Baby corn manchurian", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Paneer Manchuria", description: "Cottage cheese manchurian", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Schezwan Fried Rice", description: "Spicy Schezwan fried rice", category: "Chinese", dietaryTags: ["vegetarian"] },
  { name: "Water Melon", description: "Fresh water melon", category: "Chinese", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Guava Crush", description: "Fresh guava crush", category: "Chinese", dietaryTags: ["vegetarian", "vegan"] },

  // Mocktails
  { name: "Virgin Mojito", description: "Refreshing mint mocktail", category: "Mocktails", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Blue Lagoon", description: "Blue curacao mocktail", category: "Mocktails", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Jeera Cordial", description: "Cumin flavored drink", category: "Mocktails", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Pina Colada", description: "Coconut pineapple mocktail", category: "Mocktails", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Strawberry Punch", description: "Fresh strawberry punch", category: "Mocktails", dietaryTags: ["vegetarian", "vegan"] },

  // Italian Snacks
  { name: "Pizza", description: "Classic Italian pizza", category: "Italian Snacks", dietaryTags: ["vegetarian"] },
  { name: "Mini Pizza", description: "Small sized pizza", category: "Italian Snacks", dietaryTags: ["vegetarian"] },
  { name: "Garlic Bread", description: "Toasted garlic bread", category: "Italian Snacks", dietaryTags: ["vegetarian"] },
  { name: "Mini Burger", description: "Small vegetable burger", category: "Italian Snacks", dietaryTags: ["vegetarian"] },
  { name: "Pasta (Red & White)", description: "Italian pasta in red or white sauce", category: "Italian Snacks", dietaryTags: ["vegetarian"] },
  { name: "Italian Stuffed Roll", description: "Stuffed Italian roll", category: "Italian Snacks", dietaryTags: ["vegetarian"] },
  { name: "Thin Crust Pizza", description: "Crispy thin crust pizza", category: "Italian Snacks", dietaryTags: ["vegetarian"] },
  { name: "Grilled Pizza", description: "Grilled style pizza", category: "Italian Snacks", dietaryTags: ["vegetarian"] },
  { name: "Pizza Burns", description: "Pizza bites", category: "Italian Snacks", dietaryTags: ["vegetarian"] },

  // South Indian Tiffins
  { name: "Idly", description: "Steamed rice cakes", category: "South Indian Tiffins", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Vada", description: "Crispy lentil fritters", category: "South Indian Tiffins", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Thatta Idly", description: "Seasoned idly", category: "South Indian Tiffins", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Mysore Bajji", description: "Mysore style bajji", category: "South Indian Tiffins", dietaryTags: ["vegetarian"] },
  { name: "Tomato Bath", description: "Tomato flavored upma", category: "South Indian Tiffins", dietaryTags: ["vegetarian"] },
  { name: "Pongal", description: "Rice and lentil dish", category: "South Indian Tiffins", dietaryTags: ["vegetarian"] },
  { name: "Dosa - All Varieties", description: "Various dosa varieties", category: "South Indian Tiffins", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Pesarattu", description: "Green gram dosa", category: "South Indian Tiffins", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Poori", description: "Deep fried bread", category: "South Indian Tiffins", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Kobbari Chutney", description: "Coconut chutney", category: "South Indian Tiffins", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Palli Putnala Chutney", description: "Peanut roasted gram chutney", category: "South Indian Tiffins", dietaryTags: ["vegetarian", "vegan"] },

  // Ice Creams
  { name: "Vanilla Ice Cream", description: "Classic vanilla ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Strawberry Ice Cream", description: "Fresh strawberry ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Butter Scotch Ice Cream", description: "Creamy butterscotch ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Caramel Nuts Ice Cream", description: "Caramel with nuts ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Pistha Ice Cream", description: "Pistachio ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Tooty Fruity Ice Cream", description: "Tutti frutti ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Guava Ice Cream", description: "Fresh guava ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Honey Moon Delight Ice Cream", description: "Special honeymoon delight", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Seetha Phal Ice Cream", description: "Custard apple ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Mango Ice Cream", description: "Fresh mango ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Anjeer Badham Ice Cream", description: "Fig and almond ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Chocolate Ice Cream", description: "Rich chocolate ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Orange Ice Cream", description: "Fresh orange ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Kulfi", description: "Traditional Indian ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Badam Kulfi", description: "Almond kulfi", category: "Ice Creams", dietaryTags: ["vegetarian"] },
  { name: "Black Current Ice Cream", description: "Black currant ice cream", category: "Ice Creams", dietaryTags: ["vegetarian"] },

  // Veg Biryanis
  { name: "Vegetable Dum Biryani", description: "Aromatic vegetable dum biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Hyderabadi Veg Dum Biryani", description: "Hyderabadi style veg biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Andhra Veg Biryani", description: "Andhra style spicy biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Paneer Biryani", description: "Cottage cheese biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Mushroom Dum Biryani", description: "Mushroom dum biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Mushroom-Peas Biryani", description: "Mushroom and peas biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Dum Biryani", description: "Brinjal dum biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Panasakaya Dum Biryani", description: "Jackfruit dum biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Panasakaya Pulao", description: "Jackfruit pulao", category: "Veg Biryanis", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Chitti Muthyalu Paneer Pulao", description: "Pearl paneer pulao", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Chitti Muthyalu Mushroom Pulao", description: "Pearl mushroom pulao", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Paneer Kaju Pulao", description: "Paneer cashew pulao", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Gongoora Kaju Dum Biryani", description: "Sorrel cashew dum biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },
  { name: "Bagara Rice", description: "Fragrant spiced rice", category: "Veg Biryanis", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Plain Biryani", description: "Simple plain biryani", category: "Veg Biryanis", dietaryTags: ["vegetarian"] },

  // Veg Fry Items
  { name: "Bendi Kaju Fry", description: "Okra cashew fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Dondakaya Pakodi Fry", description: "Ivy gourd pakodi fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Aloo Green Piece Fry", description: "Potato green piece fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Aloo Beans Carrot Fry", description: "Mixed vegetable fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Beans Carrot Dum Fry", description: "Beans carrot dum fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Pakodi Fry", description: "Brinjal pakodi fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Aloo 65", description: "Spicy potato 65", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Milmaker Beerakaya Fry", description: "Ridge gourd milk fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Kandha Fry", description: "Onion fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Panasa Pottu Fry", description: "Jackfruit fry", category: "Veg Fry Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Mushroom Fry", description: "Crispy mushroom fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Aratikaya Allam Fry", description: "Raw banana ginger fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Thotakura Liver Fry", description: "Amaranth leaves fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Capsicum Pakodi", description: "Capsicum pakodi fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Chamagadda Finger Chips", description: "Taro finger chips", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Gobi 65", description: "Spicy cauliflower 65", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Cabbage 65", description: "Spicy cabbage 65", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Cabbage Shanaga Pappu Dum Fry", description: "Cabbage peanut dum fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Chikudu Kaya Dum Fry", description: "Broad beans dum fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Aloo Poosa Fry", description: "Potato poosa fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Kandha Poosa Fry", description: "Onion poosa fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },
  { name: "Kakara Kaya Fry", description: "Bitter gourd fry", category: "Veg Fry Items", dietaryTags: ["vegetarian"] },

  // Dal Items
  { name: "Dosakaya Pappu", description: "Yellow cucumber dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Tomato Pappu", description: "Tomato dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Mango Pappu", description: "Raw mango dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Palakura Pappu", description: "Spinach dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Palakura Mango Pappu", description: "Spinach mango dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Gangavelli Mango Pappu", description: "Gangavelli mango dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Thotakura Pappu", description: "Amaranth dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Mixed Leaf Pappu", description: "Mixed greens dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Gongoora Pappu", description: "Sorrel dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Beerakaya Pappu", description: "Ridge gourd dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Vankaya Pappu", description: "Brinjal dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Chinthakaya Pappu", description: "Tamarind dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Avakaya Pappu", description: "Pickle dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Muddha Pappu", description: "Plain thick dal", category: "Dal Items", dietaryTags: ["vegetarian"] },
  { name: "Tomato Pesara Pappu", description: "Tomato green gram dal", category: "Dal Items", dietaryTags: ["vegetarian"] },

  // Liquid Items
  { name: "Sambar", description: "Traditional sambar", category: "Liquid Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Pappu Charu", description: "Dal rasam", category: "Liquid Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Pesara Pappu Charu", description: "Green gram dal rasam", category: "Liquid Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Tomato Rasam", description: "Tangy tomato rasam", category: "Liquid Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Miriyala Rasam", description: "Pepper rasam", category: "Liquid Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Aratikaya Pulusu", description: "Raw banana stew", category: "Liquid Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Gummadikaya Pulusu", description: "Pumpkin stew", category: "Liquid Items", dietaryTags: ["vegetarian", "vegan"] },
  { name: "Ulavacharu + Cream", description: "Horse gram stew with cream", category: "Liquid Items", dietaryTags: ["vegetarian"] },
  { name: "Dhappalam", description: "Traditional dhappalam", category: "Liquid Items", dietaryTags: ["vegetarian"] },
  { name: "Menthe Majjiga", description: "Fenugreek buttermilk", category: "Liquid Items", dietaryTags: ["vegetarian"] },
  { name: "Pachi Pulusu", description: "Raw tamarind stew", category: "Liquid Items", dietaryTags: ["vegetarian", "vegan"] },

  // Mutton Snacks (Non-Veg)
  { name: "Mutton Keema Balls", description: "Spiced mutton keema balls", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
  { name: "Patthar ka Gosh", description: "Stone cooked mutton", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
  { name: "Nalgonda Mutton", description: "Nalgonda style mutton", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
  { name: "Mutton Sheek Kabab", description: "Grilled mutton seekh kabab", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
  { name: "Mutton Shikampuri", description: "Mutton shikampuri kebab", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
  { name: "Mutton Haleem Shots", description: "Mutton haleem shots", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
  { name: "Mutton Ghee Roast", description: "Ghee roasted mutton", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
  { name: "Kamju Pitta Fry/Tikka/Iguru", description: "Quail preparation varieties", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
  { name: "Natukodi Pulao", description: "Country chicken pulao", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
  { name: "Donne Biryani", description: "Donne style biryani", category: "Mutton Snacks", dietaryTags: ["non-vegetarian"] },
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing food items
    console.log("Clearing existing food items...");
    await FoodItemModel.deleteMany({});

    // Insert all menu items
    console.log("Inserting menu items...");
    const result = await FoodItemModel.insertMany(menuItems);
    console.log(`Successfully inserted ${result.length} menu items`);

    // Close connection
    await mongoose.disconnect();
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
