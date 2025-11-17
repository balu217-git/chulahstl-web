// src/types/menu.ts

export interface MenuItem {
  id: string;
  title: string;
  menuDetails: {
    isavailable?: boolean; // ✅ corrected name and type
    menuPrice?: string | number;
    menuDescription?: string;
    menuImage?: {
      node?: {
        sourceUrl?: string;
      };
    };
    menuCategory?: {
      nodes: CategoryNode[];
    };
  };
}


export type ChoiceOption = { 
    id: string; 
    label: string; 
    price?: number 
};
export type ChoiceGroup = { 
    id: string; 
    name: string; 
    required?: boolean; 
    type?: "single" | "multiple"; 
    options: ChoiceOption[] 
};
export type AddonItem = { 
    id: string; 
    label: string; 
    price?: number 
};

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parent?: {
    node?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}
