import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost/wp-chulahstl/graphql",
  cache: new InMemoryCache(),
});

export default client;
