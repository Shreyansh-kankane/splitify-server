import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { typeDefs } from "./schema.js";
// import db from "./_db.js";
import mongoose from "mongoose";
import User from "./models/UserModel.js";
import Group from "./models/GroupModel.js";
import Transaction from "./models/TransactionModel.js";

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
    user: async (parent, args, context, info) => {
      // return db.users.find((user) => user._id === args.id);

      const user = await User.findById(args.id);
      return user
    },
    group: async (parent, args, context, info) => {
      // return db.groups.find((group) => group._id === args.id);
      return await Group.findById(args.id)
    },
    transaction: async (parent, args, context, info) => {
      // return db.transactions.find((transaction) => transaction._id === args.id);
      return await Transaction.findById(args.id)
    }

  },
  User: {
   groups: async (parent, args, context, info) => {
      let data = await Promise.all(parent.balanceByGroup.map( async (b)=> {
        let group_id = b.group_id
        let balance = b.balance
        return {"group":await Group.findById(group_id), "balance":balance}  
      }));
      return data;
    },
    friends: (parent, args, context, info) => {
      // return db.users.filter((user) => parent.friends.includes(user._id));
      const friends = parent.friends.map(async (f)=> {
        return await User.findById(f)
      })
      return friends
    },
    transactions: async (parent, args, context, info) => {
      // return db.transactions.filter((transaction) => transaction.user_id === parent._id);
      return await Transaction.find({user:parent._id})
    }
  },
  Group: {
      // balancePerUser: (parent, args, context, info) => {
          // let users = [];
          // for (let i=0;i<db.users.length;i++){ 
          //   let user = db.users[i]
          //   let balanceByGroup = user.balanceByGroup
          //   for(let i=0; i<balanceByGroup.length; i++){
          //       if(balanceByGroup[i].group_id == parent._id){
          //         users.push({"user":user, "balance":balanceByGroup[i].balance})
          //         break;
          //       }
          //   }
          // }
          // return users
    // },
    transactions: async (parent,args) => {
      return await Transaction.find({group:parent._id})
    }
  },
  Transaction: {
    user: async (parent, args, context, info) => {
      return await User.findById(parent.user);
    },
    group: async (parent, args, context, info) => {
      return await Group.findById(parent.group);
    },
    splitbw: async (parent, args, context, info) => {
      return parent.splitbw.map(async (s)=> {
        return {"user": await User.findById(s.user), "amount":s.amount}
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

