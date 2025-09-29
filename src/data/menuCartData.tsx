// -------------------- Types --------------------
export interface MenuItem {
    id: number;
    category: string;
    name: string;
    price: number;
    likes?: number;
    description?: string;
    image: string;
}


// -------------------- Menu Items --------------------
export const menuItems: MenuItem[] = [
    // Starters - Samosas
    {
        id: 1,
        category: "Starters",
        name: "Onion Samosa (5pc)",
        price: 6.99,
        description: "Crispy onion-filled samosas served with mint chutney.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Onion+Samosa",
    },
    {
        id: 2,
        category: "Starters",
        name: "Chicken Keema Samosa (5pc)",
        price: 8.99,
        description: "Samosas stuffed with spiced chicken keema.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Chicken+Keema+Samosa",
    },
    {
        id: 3,
        category: "Starters",
        name: "Chicken N Cheese Samosa (5pc)",
        price: 8.99,
        description: "Chicken and cheese stuffed samosas served with mint chutney.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Chicken+Cheese+Samosa",
    },

    // Starters - Other
    {
        id: 4,
        category: "Starters",
        name: "Curryleaf Mushroom",
        price: 10.99,
        description: "Mushrooms cooked with aromatic curry leaves.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Curryleaf+Mushroom",
    },
    {
        id: 5,
        category: "Starters",
        name: "Chicken Saffron Kebab",
        price: 14.99,
        description: "Grilled chicken marinated with saffron and spices.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Chicken+Saffron+Kebab",
    },
    {
        id: 6,
        category: "Starters",
        name: "Paneer Tikka Kebab",
        price: 13.99,
        description: "Spiced paneer cubes grilled to perfection.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Paneer+Tikka+Kebab",
    },
    {
        id: 7,
        category: "Starters",
        name: "Chicken Pakodi Bone In",
        price: 11.99,
        description: "Fried chicken pakodi with curry leaves, mirchi, lime, and onion.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Chicken+Pakodi",
    },
    {
        id: 8,
        category: "Starters",
        name: "House Pickled Gobi Fritters",
        price: 10.99,
        description: "Crispy cauliflower fritters with house pickling spices.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Gobi+Fritters",
    },

     // Rice Bowls / Biryani
    {
        id: 9,
        category: "Rice Bowls",
        name: "Golconda Chicken Dum Biryani",
        price: 15.99,
        description: "Fragrant chicken biryani cooked with spices and basmati rice.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Golconda+Chicken+Biryani",
    },
    {
        id: 10,
        category: "Rice Bowls",
        name: "Zafrani Mutton Dum",
        price: 17.99,
        description: "Rich saffron-infused mutton dum biryani.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Zafrani+Mutton+Dum",
    },
    {
        id: 11,
        category: "Rice Bowls",
        name: "Vegetable Dum Biryani",
        price: 14.99,
        description: "Aromatic vegetable biryani cooked with basmati rice and spices.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Veg+Dum+Biryani",
    },
    {
        id: 12,
        category: "Rice Bowls",
        name: "Chittimuthyalu",
        price: 16.99,
        description: "Special mixed rice bowl with spiced meat and aromatic herbs.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Chittimuthyalu",
    },
    {
        id: 13,
        category: "Rice Bowls",
        name: "Shrimp Pulav",
        price: 16.99,
        description: "Wild-caught small river shrimp cooked with fragrant rice.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Shrimp+Pulav",
    },

    // Fried Rice
    {
        id: 14,
        category: "Rice Bowls",
        name: "Vegetarian Fried Rice",
        price: 12.99,
        description: "Stir-fried rice with fresh vegetables and aromatic spices.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Veg+Fried+Rice",
    },
    {
        id: 16,
        category: "Rice Bowls",
        name: "Egg Fried Rice",
        price: 13.99,
        description: "Fried rice with eggs and fresh vegetables.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Egg+Fried+Rice",
    },
    {
        id: 17,
        category: "Rice Bowls",
        name: "House Chicken Fried Rice",
        price: 14.99,
        description: "Fried rice with house-seasoned chicken and vegetables.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Chicken+Fried+Rice",
    },
     // Base Pizzas
    {
        id: 18,
        category: "Chulah Pizza",
        name: "Cheese Pizza",
        price: 10.99,
        description: "Hand-tossed pizza with marinara sauce, mozzarella cheese, and white sauce.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Cheese+Pizza",
    },
    {
        id: 19,
        category: "Chulah Pizza",
        name: "Vegetarian Pizza (pick 3 toppings)",
        price: 12.99,
        description: "Hand-tossed pizza with your choice of 3 vegetable toppings: Tomatoes, Olives, Onions, Mushrooms, Jalapeños, Spinach, Pineapple.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Veg+Pizza",
    },
    {
        id: 20,
        category: "Chulah Pizza",
        name: "Non-Vegetarian Pizza (pick 1 protein & 2 veggies)",
        price: 14.99,
        description: "Hand-tossed pizza with your choice of 1 protein (Chicken Tikka, Masala Ground Lamb) and 2 vegetables.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Non-Veg+Pizza",
    },

    // Extra Toppings
    {
        id: 21,
        category: "Chulah Pizza",
        name: "Extra Cheese",
        price: 0.5,
        description: "Add extra cheese to your pizza.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Extra+Cheese",
    },
    {
        id: 22,
        category: "Chulah Pizza",
        name: "Extra Vegetable Topping",
        price: 1.0,
        description: "Add additional vegetable topping: Tomatoes, Olives, Onions, Mushrooms, Jalapeños, Spinach, Pineapple.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Veg+Topping",
    },
    {
        id: 23,
        category: "Chulah Pizza",
        name: "Extra Protein Topping",
        price: 1.5,
        description: "Add extra protein topping: Chicken Tikka or Masala Ground Lamb.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Protein+Topping",
    },

    // Breads
        {   
        id: 24,
        category: "Breads",
        name: "Plain Naan",
        price: 2.75,
        description: "Soft and fluffy plain naan, perfect with curries.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Plain+Naan",
    },
    {
        id: 25,
        category: "Breads",
        name: "Garlic Naan",
        price: 3.75,
        description: "Naan brushed with flavorful garlic butter.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Garlic+Naan",
    },
    {
        id: 26,
        category: "Breads",
        name: "Butter Naan",
        price: 2.75,
        description: "Soft naan topped with melted butter.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Butter+Naan",
    },
    {
        id: 27,
        category: "Breads",
        name: "Chilli Naan",
        price: 3.75,
        description: "Spicy naan with chili and butter for extra flavor.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Chilli+Naan",
    },
    // Curries
    {
        id: 28,
        category: "Curries",
        name: "Butter Chicken Masala",
        price: 14.99,
        description: "Classic butter chicken curry served with a bowl of rice.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Butter+Chicken",
    },
    {
        id: 29,
        category: "Curries",
        name: "Saag Paneer",
        price: 13.99,
        description: "Creamy spinach curry with cubes of paneer, served with a bowl of rice.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Saag+Paneer",
    },
    {
        id: 30,
        category: "Curries",
        name: "Mughlai Chicken",
        price: 15.99,
        description: "Rich Mughlai-style chicken curry served with a bowl of rice.",
        image: "https://dummyimage.com/600x600/00282a/fff&text=Mughlai+Chicken",
    },
    {
        id: 31,
        category: "Curries",
        name: "Dal Tadka",
        price: 9.99,
        description: "Lentils tempered with spices, served with a bowl of rice.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Dal+Tadka",
    },
    // Desserts
    {
        id: 32,
        category: "Desserts",
        name: "Kulfi Fusion with Saffron",
        price: 9.99,
        description: "Traditional Indian kulfi with saffron flavor, served with or without nuts.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Kulfi+Saffron",
    },
    {
        id: 33,
        category: "Desserts",
        name: "Apricot Delight",
        price: 9.99,
        description: "Delicious apricot-flavored dessert, sweet and refreshing.",
        image: "https://dummyimage.com/600x600/00282a/000&text=Apricot+Delight",
    },
];