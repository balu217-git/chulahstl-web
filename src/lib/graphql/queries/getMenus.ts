// src/lib/graphql/queries/getMenus.ts
import { gql } from "graphql-request";

export const GET_MENUS = gql`
 query GetMenus($where: RootQueryToFoodMenuConnectionWhereArgs) {
    foodMenus(first: 500, where: $where) {
      nodes {
        id
        title
        menuDetails{
          isAvailable
          menuPrice
          menuDescription
          menuType
          choiceRequired
          choiceType
          choices {
            isAvailable
            isDefault
            label
            price
          }
          addOns {
            isAvailable
            isDefault
            label
            price
          }
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
