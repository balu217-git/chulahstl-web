import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL!);

export default client;
