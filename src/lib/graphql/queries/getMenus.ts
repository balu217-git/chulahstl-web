// import { gql } from "@apollo/client";

import { gql } from "graphql-request";

// export interface MenuItem {
//   id: string;
//   title: string;
//   menuDetails: {
//     isavailable: boolean;
//     menuPrice: number;
//     menuDescription: string;
//     menuCategory: {
//       nodes: {
//         id: string;
//         name: string;
//         slug: string;
//         parent?: {
//           node: {
//             id: string;
//             name: string;
//             slug: string;
//           };
//         };
//       }[];
//     };
//     menuImage: {
//       node: {
//         altText: string;
//         sourceUrl: string;
//       };
//     };
//   };
// }

// export interface MenuQueryResult {
//   foodMenus: {
//     nodes: MenuItem[];
//   };
// }

// ✅ Added `$where` argument for filtering (optional)
export const GET_MENUS = gql`
 query GetMenus($where: RootQueryToFoodMenuConnectionWhereArgs) {
    foodMenus(first: 20, where: $where) {
      nodes {
        id
        title
        menuDetails{
          isavailable
          menuPrice
          menuDescription
          menuCategory(first: 20) {
            nodes {
              name
              slug
              id
              ... on Category {
                id
                name
                parent {
                  node {
                    id
                    name
                    slug
                    count
                  }
                }
                count
              }
              count
            }
          }
          menuImage {
            node {
              altText
              id
              sourceUrl
              title
            }
          }
        }
      }
    }
  }
`;
