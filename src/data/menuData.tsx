export type MenuItem = {
  name: string;
  description: string;
  price: string;
  image: string;
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
      { name: "Veg Spring Rolls", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
      { name: "Chicken Tikka", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg"},
      { name: "Paneer Chilli", description: "Smoky grilled paneer",price: "000/-", image: "/img/paneer.jpg"}
    ],
    "Main Course": [
      { name: "Paneer Butter Masala", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
      { name: "Chicken Biryani", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg"  },
      { name: "Dal Tadka", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg"}
    ],
    Alcohol: {
      Beers: [
        { name: "Kingfisher Premium / Ultra", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
        { name: "Bira 91 Blonde / White", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
        { name: "Heineken", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" }
      ],
      Wines: [
        { name: "Sula Rasa Shiraz (India)", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
        { name: "Grover Zampa La Réserve (India)", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" }
      ],
      "Whiskey / Bourbon": [
        { name: "Royal Challenge", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
        { name: "Chivas Regal 12YO", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" }
      ],
      "Sparkling & Champagne": [
        { name: "Sula Brut (India)", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
        { name: "Moët & Chandon Brut (France)", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" }
      ]
    },
    Cocktails: [
      { name: "Mojito", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
      { name: "Long Island Iced Tea", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
      { name: "Cosmopolitan", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" }
    ],
    Dessert: [
      { name: "Chocolate Brownie", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
      { name: "Gulab Jamun", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" },
      { name: "Ice Cream", description: "Smoky grilled paneer", price: "000/-", image: "/img/paneer.jpg" }
    ]
  }
};
