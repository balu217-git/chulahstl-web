export type MenuItem = {
  name: string;
  price: string;
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
  "Quick Service Lunches": MenuSection;
  Dinner: MenuSection;
  Alcohols: MenuSection;
  Cocktails: MenuSection;
  Dessert: MenuSection;
};

export const menuData: { menu: Menu } = {
  menu: {
    "Quick Service Lunches": {
      title: "Quick Service Lunches",
      content: "Coming Soon!"
    },
    Dinner: {
      title: "Dinner",
      content: {
        Kebabs: [
          { name: "Paneer Tikka Kebab", price: "$14.99" },
          { name: "Paneer Hariyali Kebab", price: "$14.99" },
          { name: "Afghani Paneer Tikka Kebab", price: "$15.99" },
          { name: "Chicken Saffron Kebab", price: "$15.99" },
          { name: "Chicken Hariyali Kebab", price: "$15.99" },
          { name: "Chicken Malai Kebab", price: "$16.99" }
        ],
        Tandoori: [
          { name: "Peshwari Lamb Chops", price: "$19.99" },
          { name: "Tandoori Salmon", price: "$19.99" },
          { name: "Tandoori Platter", price: "$21.99" }
        ],
        "Chulah Pizza": [
          { name: "Cheese Pizza", price: "$10.99" },
          { name: "Vegetarian Pizza (pick 3 toppings)", price: "$12.99" },
          { name: "Non-Vegetarian Pizza (pick 1 protein and 2 vegetables)", price: "$14.99" },
          { name: "Extra Cheese", price: "$0.50" },
          { name: "Vegetable Topping", price: "$1.50" },
          { name: "Protein Topping", price: "$1.00" }
        ],
        "Rice Bowls": [
          { name: "Veg Biryani", price: "$14.99" },
          { name: "Veg Fried Rice", price: "$13.99" },
          { name: "Paneer Biryani", price: "$15.99" },
          { name: "Egg Fried Rice", price: "$14.99" },
          { name: "Andhra Veg Biryani", price: "$15.99" },
          { name: "Chicken Biryani", price: "$15.99" },
          { name: "Golconda Chicken Dum Biryani", price: "$15.99" },
          { name: "Shrimp Biryani", price: "$17.99" },
          { name: "Zatrani Mutton Dum Biryani", price: "$17.99" },
          { name: "Boneless Chicken Biryani", price: "$16.99" },
          { name: "Chicken Fry Piece Pulav", price: "$16.99" },
          { name: "Vijayawada Boneless Chicken Pulav", price: "$17.99" },
          { name: "Veg Pulav", price: "$16.99" },
          { name: "Goat Fry Piece Pulav", price: "$20.99" },
          { name: "Goat Pulav", price: "$17.99" },
          { name: "Shrimp Pulav", price: "$18.99" },
          { name: "Lamb Pulav", price: "$18.99" }
        ],
        Pastas: [
          { name: "Spaghetti Tikka Masala", price: "$16.99" },
          { name: "Penne Arrabbiata", price: "$19.99" },
          { name: "Pasta Chulah", price: "$21.99" },
          { name: "Add Chicken", price: "$2.99" },
          { name: "Add Shrimp", price: "$5.99" },
          { name: "Add Lamb", price: "$6.99" },
          { name: "Chopped Salad (add-on)", price: "$6.99" }
        ]
      }
    },
    Alcohols: {
      title: "Alcohols",
      description:
        "Exquisite Cocktails, mocktails, bourbons, wines, whiskies, beers and more.",
      content: "Coming Soon!"
    },
    Cocktails: {
      title: "Cocktails",
      content: "Coming Soon!"
    },
    Dessert: {
      title: "Dessert",
      content: [
        { name: "Chocolate Brownie", price: "000/-" },
        { name: "Gulab Jamun", price: "000/-" },
        { name: "Ice Cream", price: "000/-" }
      ]
    }
  }
};
