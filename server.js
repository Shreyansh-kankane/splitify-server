import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { typeDefs } from "./schema.js";
// import db from "./_db.js";
import mongoose from "mongoose";
import User from "./models/UserModel.js";
import Group from "./models/GroupModel.js";
import Transaction from "./models/TransactionModel.js";


import { GraphQLScalarType } from 'graphql';
import { solveData } from "./algo.js";

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
      console.log('get user')
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
    },
    getExpenseFeed: async (parent, args, context, info) => {
      let group = await Group.findById(args.groupId).select('balancePerUser');
      let transactions = await Transaction.find({ group: args.groupId });

      let data = {
        nodes: [],
        edges: []
      }
      const userIds = group.balancePerUser.map(u => u.user);
      const users = await User.find({ _id: { $in: userIds } }).select('name');

      const userMap = {};
      users.forEach(user => {
        userMap[user._id] = user.name;
        data.nodes.push(user._id.toString());
      });

      transactions.forEach(t => {
        const { splitbw, type: transactionType, amount: transactionAmount, user: to } = t;

        splitbw.forEach(s => {
          let { user: from, amount } = s;

          if (transactionType === "equally") {
            amount = transactionAmount / splitbw.length;
          } else if (transactionType === "percentage") {
            amount = (transactionAmount * amount) / 100;
          } else if (transactionType === "shares") {
            amount = transactionAmount * amount;
          } else if (transactionType === "custom") {
            amount = s.amount;
          }
          data.edges.push({ from: from.toString(), to: to.toString(), label: amount }); // Convert ObjectId to string
        });
      });

      // console.log(data);
      // return {edges:[]}
      let res = solveData(data);
      for (let i = 0; i < res.edges.length; i++) {
        let e = res.edges[i];
        e.from = userMap[e.from];
        e.to = userMap[e.to];
      }
      const new_vals = {}
      Object.keys(res.vals).forEach(uid => {
        const balance = res.vals[uid];
        new_vals[userMap[uid]] = balance;
      });
      res.vals = new_vals;
      console.log(res);
      return { edges: res.edges };
    },
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
      balancePerUser : async (parent, args, context, info) => {
        let data = await Promise.all(parent.balancePerUser.map( async (b)=> {
          let user_id = b.user
          let balance = b.balance
          return {"user":await User.findById(user_id), "balance":balance}  
        }));
        return data;  
      },

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
  },


  Mutation: {
    createUser: async (parent, args, context, info) =>{
      const user = new User({
        name: args.name,
        email: args.email,
        password: args.password,
        phoneNo: args.phoneNo,
        imageUrl: args.imageUrl,
      });
      return  await user.save();
    },
    updateUser: async (parent, args, context, info) => {
      const user = await User.findById(args.id);
      user.phoneNo = args.edits.phoneNo || user.phoneNo;
      user.imageUrl = args.edits.imageUrl || user.imageUrl;
      user.contact = args.edits.contact || user.contact;
      return await user.save();
    },
    createGroup: async (parent, args, context, info) => {
      const group = new Group({
        name: args.name,
        type: args.type,
        imageUrl: args.imageUrl,
        admin: args.admin,
        balancePerUser: [{ "user": args.admin, "balance":0}]
      });
      return await group.save();
    },
    addGroupMember: async (parent, args, context, info) => {
      const group = await Group.findById(args.groupId);
      for(let i=0; i<args.userIds.length; i++){
        group.balancePerUser.push({"user": args.userIds[i] , "balance":0})
      }
      return await group.save();
    },
    addFriend: async (parent, args, context, info) => {
      const user = await User.findById(args.id);
      const friend = await User.findById(args.friendId);

      user.friends.push(args.friendId);
      friend.friends.push(args.id);
    },
    createTransaction: async (parent, args, context, info) => {
      const transactionType = args.type;
      let splitbw = [];
      if( transactionType === "equally" ){ 
        let amount = args.amount;
        let group = await Group.findById(args.group);
        let users = group.balancePerUser;
        let n = users.length;
        for(let i=0; i<n; i++){
          splitbw.push({"user":users[i].user, "amount":amount/n})
        }
      }
       

      const t = await Transaction.create({
        description: args.description,
        amount: args.amount,
        user: args.user,
        group: args.group,
        type: args.type,
        currencyType: args.currencyType,
        splitbw: splitbw
      })
      return t;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server)

console.log(`🚀 Server ready at ${url}`)

