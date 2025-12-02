// src/types/menu.ts
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
  count?: number;
}

export type ChoiceOptionFromAPI = {
  isAvailable?: boolean;
  isDefault?: boolean;
  label: string;
  price?: number | string | null;
};

export type AddOnFromAPI = {
  isAvailable?: boolean;
  isDefault?: boolean;
  label: string;
  price?: number | string | null;
};

export interface MenuDetails {
  isAvailable?: boolean;
  menuPrice?: string | number;
  menuDescription?: string;
  menuImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
      id?: string;
      title?: string;
    };
  };
  menuCategory?: {
    nodes: CategoryNode[];
  };
  choiceRequired?: boolean;
  choiceType?: "single" | "multiple" | "radio" | "checkbox";
  choices?: ChoiceOptionFromAPI[];
  addOns: AddOnFromAPI[];
  menuType?: string | null;
}

export interface MenuItem {
  id: string;
  title: string;
  menuDetails: MenuDetails;
}
