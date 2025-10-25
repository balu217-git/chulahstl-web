// src/types/menu.ts

export interface MenuItem {
  id: string;
  title: string;
  menuFields: {
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
