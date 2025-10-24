import { gql } from "@apollo/client";


interface MenuItem {
  id: string;
  slug: string;
  title: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  };
  menuFields: {
    menu_price: number;
    menu_category: string;
    menu_image?: string;
    menu_description: string;
    isavailable: boolean;
  };
}

interface MenuQueryResult {
  menus: {
    nodes: MenuItem[];
  };
}


export const GET_MENUS = gql`
  query GetMenus {
    menus(first: 20) {
      nodes {
        id
        slug
        title
        featuredImage {
          node {
            sourceUrl
          }
        }
        menuFields {
          menu_price
          menu_category
          menu_image
          menu_description
          isavailable
        }
      }
    }
  }
`;
