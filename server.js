import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { typeDefs } from "./schema.js";
import db from "./_db.js";

const resolvers = {
  Query: {
    user: (parent, args, context, info) => {
      return db.users.find((user) => user.id === args.id);
    },
    group: (parent, args, context, info) => {
      return db.groups.find((group) => group.id === args.id);
    },
    transaction: (parent, args, context, info) => {
      return db.transactions.find((transaction) => transaction.id === args.id);
    }
  },
  User: {
    groups: (parent, args, context, info) => {
      return db.groups.filter((group) => parent.groups_id.includes(group.id));
    },
    friends: (parent, args, context, info) => {
      return db.users.filter((user) => parent.friends.includes(user.id));
    },
    transactions: (parent, args, context, info) => {
      return db.transactions.filter((transaction) => transaction.user_id === parent.id);
    }
  },
  Group: {
    users: (parent, args, context, info) => {
      return db.users.filter((user) => user.groups_id.includes(parent.id));
    },
    transactions: (parent,args) => {
      return db.transactions.filter((t)=> t.group_id == parent.id)
    }
  },
  Transaction: {
    user: (parent, args, context, info) => {
      return db.users.find((user) => user.id === parent.user_id);
    },
    group: (parent, args, context, info) => {
      return db.groups.find((group) => group.id === parent.group_id);
    }
  }


};

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server)

console.log(`🚀 Server ready at ${url}`)

