import { gql } from "@apollo/client";

export const GET_MENU_BY_SLUG = gql`
  query GetMenuBySlug($slug: ID!) {
    menu(id: $slug, idType: SLUG) {
      id
      title
      slug
      menuDetails {
        menuPrice
        menuDescription
        isavailable
        menuCategory {
          nodes {
            id
            name
          }
        }
        menuImage {
          node {
            id
            sourceUrl
          }
        }
      }
    }
  }
`;
