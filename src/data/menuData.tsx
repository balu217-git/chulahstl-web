export type MenuItem = {
  name: string;
  price: string;
};

export type AlcoholMenu = {
  Beers: MenuItem[];
  Wines: MenuItem[];
  "Whiskey / Bourbon": MenuItem[];
  "Sparkling & Champagne": MenuItem[];
};

export type Menu = {
  Starters: MenuItem[];
  "Main Course": MenuItem[];
  Alcohol: AlcoholMenu;
  Cocktails: MenuItem[];
  Dessert: MenuItem[];
};

export const menuData: { menu: Menu } = {
  menu: {
    Starters: [
      { name: "Onion Samosa (5pc)", price: "$6.99" },
      { name: "Chicken Tikkaa Samosa (5pc)", price: "$9.99" },
      { name: "Punjabi Samos (2pc)", price: "$7.99" },
      { name: "Chulah Fries (cajun) (served with mint chutney)", price: "$9.99" },
      { name: "Gobi Fritters", price: "$9.99" },
      { name: "Railway Cutlet", price: "$9.99" }
    ],
    "Main Course": [
      { name: "Paneer Butter Masala", price: "000/-" },
      { name: "Chicken Biryani", price: "000/-" },
      { name: "Dal Tadka", price: "000/-" }
    ],
    Alcohol: {
      Beers: [
        { name: "Kingfisher Premium / Ultra", price: "000/-" },
        { name: "Bira 91 Blonde / White", price: "000/-" },
        { name: "Heineken", price: "000/-" }
      ],
      Wines: [
        { name: "Sula Rasa Shiraz (India)", price: "000/-" },
        { name: "Grover Zampa La Réserve (India)", price: "000/-" }
      ],
      "Whiskey / Bourbon": [
        { name: "Royal Challenge", price: "000/-" },
        { name: "Chivas Regal 12YO", price: "000/-" }
      ],
      "Sparkling & Champagne": [
        { name: "Sula Brut (India)", price: "000/-" },
        { name: "Moët & Chandon Brut (France)", price: "000/-" }
      ]
    },
    Cocktails: [
      { name: "Mojito", price: "000/-" },
      { name: "Long Island Iced Tea", price: "000/-" },
      { name: "Cosmopolitan", price: "000/-" }
    ],
    Dessert: [
      { name: "Chocolate Brownie", price: "000/-" },
      { name: "Gulab Jamun", price: "000/-" },
      { name: "Ice Cream", price: "000/-" }
    ]
  }
};
