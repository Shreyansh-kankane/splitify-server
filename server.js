import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { typeDefs } from "./schema.js";
import db from "./_db.js";
import mongoose from "mongoose";

import { GraphQLScalarType, Kind } from 'graphql';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime(); // Convert outgoing Date to integer for JSON
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
  parseValue(value) {
    if (typeof value === 'number') {
      return new Date(value); // Convert incoming integer to Date
    }
}});

mongoose.connect("mongodb://localhost:27017/splitify", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const resolvers = {
  Date: dateScalar,
  Query: {
    user: (parent, args, context, info) => {
      return db.users.find((user) => user._id === args.id);
    },
    group: (parent, args, context, info) => {
      return db.groups.find((group) => group._id === args.id);
    },
    transaction: (parent, args, context, info) => {
      return db.transactions.find((transaction) => transaction._id === args.id);
    }

  },
  User: {
    groups: (parent, args, context, info) => {
      // return db.groups.filter((group) => parent.groups_id.includes(group._id));
      let data =  parent.balanceByGroup.map((b)=> {
        let group_id = b.group_id
        let balance = b.balance
        return {"group":db.groups.find((group) => group._id === group_id), "balance":balance}
      })

      // console.log(data)
      return data
    },
  


    friends: (parent, args, context, info) => {
      return db.users.filter((user) => parent.friends.includes(user._id));
    },
    transactions: (parent, args, context, info) => {
      return db.transactions.filter((transaction) => transaction.user_id === parent._id);
    }
  },
  Group: {
      balancePerUser: (parent, args, context, info) => {
          let users = [];
          for (let i=0;i<db.users.length;i++){ 
            let user = db.users[i]
            let balanceByGroup = user.balanceByGroup
            for(let i=0; i<balanceByGroup.length; i++){
                if(balanceByGroup[i].group_id == parent._id){
                  users.push({"user":user, "balance":balanceByGroup[i].balance})
                  break;
                }
            }
          }
          return users
    },
    transactions: (parent,args) => {
      return db.transactions.filter((t)=> t.group_id == parent._id)
    }
  },
  Transaction: {
    user: (parent, args, context, info) => {
      return db.users.find((user) => user._id === parent.user_id);
    },
    group: (parent, args, context, info) => {
      return db.groups.find((group) => group._id === parent.group_id);
    },
    splitbw: (parent, args, context, info) => {
      return parent.splitbw.map((s)=> {
        return {"user":db.users.find((user) => user._id === s.user), "amount":s.amount}
      })
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server)

console.log(`🚀 Server ready at ${url}`)

