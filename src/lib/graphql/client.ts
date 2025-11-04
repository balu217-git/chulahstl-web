import { GraphQLClient } from "graphql-request";

const endpoint =
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
  "https://cms.chulahstl.com/graphql"; // ✅ replace with your actual WP GraphQL endpoint

if (!endpoint || !endpoint.startsWith("http")) {
  throw new Error(`❌ Invalid GraphQL endpoint: ${endpoint}`);
}

const client = new GraphQLClient(endpoint);

export default client;
