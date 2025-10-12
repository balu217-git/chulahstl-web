export type MenuItem = {
  name: string;
  price: string;
  description?: string;
};

export type DinnerCategory = {
  [subcategory: string]: MenuItem[] | string;
};

export type MenuSection = {
  title: string;
  description?: string;
  content: "Coming Soon!" | DinnerCategory | MenuItem[];
};

export type Menu = {
  "Starters | Breads": MenuSection;
  Vegan: MenuSection;
  Curries: MenuSection;
  "Wok Tossed | Thai": MenuSection;
  "Pastas | Rice Bowls": MenuSection;
  "Advance Order Specials": MenuSection;
  "Desserts | Cold Beverages": MenuSection;
};

export const menuData: { menu: Menu } = {
  menu: {
    "Starters | Breads": {
      title: "Starters | Breads",
      content: {
        "Samosas | Fries | Specials": [
          { name: "Onion Samosa (5pc)", price: "$6.99" },
          { name: "Chicken Tikka Samosa (5pc)", price: "$9.99" },
          { name: "Punjabi Samosa (2pc)", price: "$7.99" },
          { name: "Chulah Fries", price: "$9.99" },
          { name: "Gobi Fritters", price: "$9.99" },
          { name: "Railway Cutlet", price: "$9.99" },
          { name: "Chicken Pakodi (Bone In)", price: "$13.99" },
          { name: "Apollo Fish", price: "$16.99" }
        ],
        Manchuria: [
          { name: "Gobi", price: "$15.99" },
          { name: "Baby Corn", price: "$15.99" },
          { name: "Paneer", price: "$16.99" },
          { name: "Chicken", price: "$16.99" }
        ],
        "65": [
          { name: "Gobi", price: "$14.99" },
          { name: "Baby Corn", price: "$14.99" },
          { name: "Paneer", price: "$15.99" },
          { name: "Chicken", price: "$15.99" }
        ],
        Chilli: [
          { name: "Gobi", price: "$15.99" },
          { name: "Baby Corn", price: "$15.99" },
          { name: "Paneer", price: "$16.99" },
          { name: "Chicken", price: "$16.99" },
          { name: "Fish", price: "$17.99" }
        ],
        "Chicken Wings & Specials": [
          { name: "Chicken Wings", price: "$16.99" },
          { name: "Dragon", price: "$13.99" },
          { name: "Shangai", price: "$14.99" },
          { name: "Chulah Spiced", price: "$15.99" },
          { name: "Chulah Clammy", price: "$16.99" }
        ],
        Breads: [
          { name: "Aloo Paratha", price: "$5.75" },
          { name: "Paneer Paratha", price: "$6.75" }
        ],
        Naans: [
          { name: "Plain", price: "$3.00" },
          { name: "Butter", price: "$3.00" },
          { name: "Garlic", price: "$3.75" },
          { name: "Chilli", price: "$4.00" },
          { name: "Chilli-Garlic", price: "$4.25" }
        ]
      }
    },
    Vegan: {
      title: "Vegan",
      content: {
        Starters: [
          { name: "Chulah Fries (cajun)", price: "$9.99" },
          { name: "Gobi Fritters", price: "$9.99" },
          { name: "Railway Cutlet", price: "$9.99" }
        ],
        "Salad | Hakka Noodles": [
          { name: "Chopped Salad", price: "$6.99" },
          { name: "Veg Hakka Noodles", price: "$13.99" }
        ],
        "Lentils & Legumes": [
          { name: "Lentil Soup", price: "$12.99" },
          { name: "Dal (plain)", price: "$13.99" },
          { name: "Dal Tadka", price: "$15.99" },
          { name: "Chana Masala", price: "$14.00" }
        ]
      }
    },
    Curries: {
      title: "Curries",
      content: {
        "Lentils & Legumes": [
          { name: "Dal (plain)", price: "$12.99" },
          { name: "Dal Tadka", price: "$13.99" },
          { name: "Lentil Soup", price: "$15.99" },
          { name: "Chana Masala", price: "$14.00" }
        ],
        Masalas: [
          { name: "Veg Tikka", price: "$14.99" },
          { name: "Paneer Tikka", price: "$15.99" },
          { name: "Chicken Tikka", price: "$15.99" },
          { name: "Lamb Tikka", price: "$16.99" },
          { name: "Salmon Tikka", price: "$20.99" },
          { name: "Shrimp Tikka", price: "$20.99" },
          { name: "Butter Paneer", price: "$14.99" },
          { name: "Butter Chicken", price: "$14.99" }
        ],
        Mughlai: [
          { name: "Veg", price: "$16.99" },
          { name: "Paneer", price: "$17.99" },
          { name: "Chicken", price: "$17.99" },
          { name: "Lamb", price: "$18.99" }
        ],
        "Shahi Korma": [
          { name: "Veg", price: "$16.99" },
          { name: "Paneer", price: "$17.99" },
          { name: "Chicken", price: "$17.99" },
          { name: "Veg Korma (regular)", price: "$18.99" }
        ],
        Saag: [
          { name: "Veg", price: "$14.99" },
          { name: "Paneer", price: "$15.99" },
          { name: "Chicken", price: "$15.99" },
          { name: "Lamb", price: "$17.99" }
        ],
        "Fry | Special": [
          { name: "Goat Fry", price: "$18.99" },
          { name: "Lamb Fry", price: "$19.99" },
          { name: "Makhmali Murg (Kali Mirchi)", price: "$18.99" }
        ],
        Chetinadu: [
          { name: "Veg", price: "$14.99" },
          { name: "Paneer", price: "$15.99" },
          { name: "Chicken", price: "$15.99" },
          { name: "Lamb", price: "$16.99" }
        ]
      }
    },
    "Wok Tossed | Thai": {
  title: "Wok Tossed | Thai",
  content: {
    "Wok Tossed Noodles": [
      { name: "Veg", price: "$13.99" },
      { name: "Egg", price: "$14.99" },
      { name: "Chicken", price: "$15.99" },
      { name: "Shrimp", price: "$17.99" }
    ],
    "Thai Basil Fried Rice": [
      { name: "Veg", price: "$14.99" },
      { name: "Egg", price: "$15.99" },
      { name: "Chicken", price: "$16.99" },
      { name: "Shrimp", price: "$18.99" }
    ]
  }
},
   "Pastas | Rice Bowls": {
  title: "Pastas | Rice Bowls",
  content: {
    "Indo-European Pasta (veg/non-veg)": [
      { name: "Spaghetti Tikka Masala", price: "$16.99" },
      { name: "Penne Arrabbiata", price: "$19.99" },
      { name: "Pasta Chulah", price: "$21.99" },
      { name: "Add Chicken", price: "$2.99" },
      { name: "Add Shrimp", price: "$5.99" },
      { name: "Add Lamb", price: "$6.99" },
      { name: "Chopped Salad (add-on)", price: "$6.99" }
    ],
    Biryanis: [
      { name: "Veg", price: "$14.99" },
      { name: "Paneer", price: "$15.99" },
      { name: "Andhra Veg", price: "$15.99" },
      { name: "Golconda Chicken Dum", price: "$15.99" },
      { name: "Zafrani Mutton Dum", price: "$17.99" },
      { name: "Boneless Chicken", price: "$16.99" },
      { name: "Chicken Fry Piece", price: "$16.99" },
      { name: "Vijayawada Boneless Chicken", price: "$17.99" },
      { name: "Goat Fry Piece", price: "$17.99" },
      { name: "Shrimp", price: "$20.99" }
    ],
    "Fried Rice": [
      { name: "Veg", price: "$13.99" },
      { name: "Egg", price: "$14.99" },
      { name: "Chicken", price: "$15.99" },
      { name: "Shrimp", price: "$17.99" }
    ],
    Pulavs: [
      { name: "Veg", price: "$15.99" },
      { name: "Chicken", price: "$16.99" },
      { name: "Goat", price: "$17.99" },
      { name: "Lamb", price: "$18.99" },
      { name: "Shrimp", price: "$17.99" }
    ]
  }
},

    "Advance Order Specials": {
  title: "Advance Order Specials",
  description: "* Pre-order Only | 2-3 days notice required | Each order serves 5-6 people | For pricing, please consult with our staff",
  content: {
    "Mutton | Chicken Yakhni Pulav": [
      {
        name: "Mutton Yakhni Pulav",
        price: "Consult Staff",
        description: "Aromatic basmati rice slow-cooked in spiced broth with tender mutton"
      },
      {
        name: "Chicken Yakhni Pulav",
        price: "Consult Staff",
        description: "Aromatic basmati rice slow-cooked in spiced broth with tender chicken"
      }
    ],
    "Chulah Sourdough Sandwich Basket": [
      {
        name: "Chicken Sourdough Sandwich Basket",
        price: "Consult Staff",
        description: "Basket of fresh sourdough sandwiches filled with chicken, served with signature chutneys"
      },
      {
        name: "Lamb Sourdough Sandwich Basket",
        price: "Consult Staff",
        description: "Basket of fresh sourdough sandwiches filled with house-ground lamb, served with signature chutneys"
      },
      {
        name: "Shrimp Sourdough Sandwich Basket",
        price: "Consult Staff",
        description: "Basket of fresh sourdough sandwiches filled with shrimp, served with signature chutneys"
      }
    ],
    "Goat Haleem": [
      {
        name: "Goat Haleem",
        price: "Consult Staff",
        description: "Creamy stew of goat, lentils, and cracked wheat slow-cooked to rich perfection"
      }
    ],
    "Mutton Gosht Dalcha": [
      {
        name: "Mutton Gosht Dalcha",
        price: "Consult Staff",
        description: "Hearty lentil and mutton curry slow-braised with warming spices and veggies"
      }
    ],
    "Mutton Hari Mirchi Keema": [
      {
        name: "Mutton Hari Mirchi Keema",
        price: "Consult Staff",
        description: "Spicy minced mutton tossed with green chillies, onions, and whole spices for a bold kick"
      }
    ]
  }
},
"Desserts | Cold Beverages": {
  title: "Desserts | Cold Beverages",
  content: {
    Desserts: [
      { name: "Apricot Delight", price: "$10.99" },
      { name: "Mango Marvel", price: "$9.99" },
      { name: "Kulfi Fusion", price: "$9.99" },
      { name: "Kulfi", price: "$2.99" }
    ],
    Fountains: [
      { name: "Coke | Diet Coke | Sprite", price: "$2.99" },
      { name: "Fanta | Lemonade | Dr. Pepper", price: "$2.99" }
    ],
    "Canned Soda": [
      { name: "Coke | Diet Coke | Sprite", price: "$1.49" },
      { name: "Thumbs Up | Limca", price: "$2.99" }
    ],
    "Special Beverages": [
      { name: "Mango Lassi", price: "$3.99" }
    ]
  }
}

  }
};
