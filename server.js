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
import bcrypt from 'bcrypt';

import dotenv from 'dotenv';
dotenv.config();

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
    },
    getExpenseFeed: async (parent, args, context, info) => {
      // let group = await Group.findById(args.groupId).select('balancePerUser');
      let g = await Group.findById(args.groupId);
      let u = g.users.map((u)=>{return u.toString()});
      let users = await Promise.all(
        u.map(async (id) => {
          let {_id, name} =  await User.findById(id).select('_id name')
          return ({_id: _id.toString() , name});
        })
      )

      let transactions = await Transaction.find({ group: args.groupId });

      console.log(transactions);

      let data = {
        nodes: [],
        edges: []
      }

      const userMap = {};
      users.forEach(user => {
        userMap[user._id] = user.name;
        data.nodes.push(user._id.toString());
      });

      transactions.forEach(t => {
        const { splitbw, type: transactionType, amount: transactionAmount, user: to } = t;

        splitbw.forEach(s => {
          let { user: from, amount } = s;

          // if (transactionType === "equally") {
          //   amount = transactionAmount / splitbw.length;
          // } else if (transactionType === "percentage") {
          //   amount = (transactionAmount * amount) / 100;
          // } else if (transactionType === "shares") {
          //   amount = transactionAmount * amount;
          // } else if (transactionType === "custom") {
          //   amount = s.amount;
          // }
          data.edges.push({ from: from.toString(), to: to.toString(), label: amount }); // Convert ObjectId to string
        });
      });

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
      return { 
        edges: res.edges,
        nodes: res.vals
      };
    },
  },
  User: {
   groups: async (parent, args, context, info) => {
      const data = await Promise.all(parent.groups.map( async (d)=> {
        return {"group":await Group.findById(d.group_id), "balance":d.balance}  
      }));
      return data;
    },
    friends: async (parent, args, context, info) => {
      const data = await Promise.all(parent.friends.map(async (d)=>{
        return {"friend":await User.findById(d.friend_id), "balance":d.balance}
      }));
      return data;
    },
    transactions: async (parent, args, context, info) => {
      // return db.transactions.filter((transaction) => transaction.user_id === parent._id);
      return await Transaction.find({user:parent._id})
    }
  },
  Group: {
    admin: async (parent, args, context, info) => {
      return await User.findById(parent.admin);
    },
    users : async (parent, args, context, info) => {
      let data = await Promise.all(parent.users.map(async (u)=> {
        return await User .findById(u);
      }))
      return data;
    },
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
      const user = await User.find({email : args.email});
      if(user.length > 0) {
        throw new Error("user already exists with this email");
      };

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(args.password, salt);

      const newUser = new User({
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        password: hashedPassword,
        phoneNo: args.phoneNo,
        contact: "",
        total_owed: 0, 
        isVerified: false, 
      });

      const nonExpenseGroup = new Group({
        name: "Non-Expense",
        type: "Other",
        currencyType: "INR",
        admin: newUser._id,
        users: [newUser._id],
      });

      newUser.groups.push({ group_id: nonExpenseGroup._id, balance: 0 }); // non group expense should be at index 0 always
      await nonExpenseGroup.save();
      return await newUser.save();
    },
    createUserWithGoogleSignIn: async (parent,args,context,info)=>{
      const user = await User.find({email : args.email});
      if(user) {
        return user;
      };

      const newUser = new User({
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        total_owed: 0, 
        isVerified: true, 
      });
      return  await newUser.save();
    },
    updateUser: async (parent, args, context, info) => {
      const user = await User.findById(args.id);
      user.phoneNo = args.edits.phoneNo || user.phoneNo;
      user.imageUrl = args.edits.imageUrl || user.imageUrl;
      user.contact = args.edits.contact || user.contact;
      return await user.save();
    },
    updateUserPassword: async (parent, args, context, info) => {
      const user = await User.findById(args.id);
      const token = args.token;
      if (user.resetPasswordToken === token && user.resetPasswordTokenExpires > Date.now()) {
        user.password = args.password;
        return await user.save();
      }
      return null;
    },
    createGroup: async (parent, args, context, info) => {
      const group = new Group({
        name: args.name,
        type: args.type,
        imageUrl: args.imageUrl,
        currencyType: args.currencyType,
        admin: args.admin,
        users: [args.admin],
      });

      const user = await User.findById(args.admin);
      user.groups.push({ group_id: group._id, balance: 0 });
      await user.save();
      return await group.save();
    },
    addGroupMember: async (parent, args, context, info) => {
      const group = await Group.findById(args.groupId);

      const groupUsers = await Promise.all(group.users.map(async(uid)=>{
        return await User.findById(uid);
      }));

      const newUsers = await Promise.all(args.userIds.map(async (uid) => {
        return await User.findById(uid);
      }));

      for (let i = 0; i < newUsers.length; i++) {
        const newUser = newUsers[i];

        for (let j = 0; j < groupUsers.length; j++) {
          const groupUser = groupUsers[j];

          // Check if newUser is already a friend of groupUser
          if (!groupUser.friends.some(friend => friend.friend_id.toString() === newUser._id.toString()) ) {
            groupUser.friends.push({ friend_id: newUser._id, balance: 0 });
          }

          // Check if groupUser is already a friend of newUser
          if (!newUser.friends.some(friend => friend.friend_id.toString() === groupUser._id.toString())) {
            newUser.friends.push({ friend_id: groupUser._id, balance: 0 });
          }

          // Save the updated groupUser
          await groupUser.save();
        }

        for (let j = 0; j < newUsers.length; j++) {
          const f2 = newUsers[j];
          if (i != j) {
            if (!newUser.friends.some(friend => friend.friend_id.toString() === f2._id.toString())) {
              newUser.friends.push({ friend_id: f2._id, balance: 0 });
            }
          }
        }

        // check if newUser is already in the group
        if (!group.users.includes(newUser._id)) {
          group.users.push(newUser._id);
          newUser.groups.push({ group_id: group._id, balance: 0 })
        }

        // Save the updated newUser
        await newUser.save();
      }

      return await group.save(); 
    },
    addFriend: async (parent, args, context, info) => {

      if(args.id === args.friendId){
        throw new Error("Cannot add yourself as friend");
      }

      const user = await User.findById(args.id);
      const friend = await User.findById(args.friendId);

      if(user.friends.some(f => f.friend_id.toString() === args.friendId)){
        throw new Error("Friend already exists");
      }
    
      user.friends.push({
        friend_id: args.friendId,
        balance: 0
      });

      friend.friends.push({
        friend_id: args.id,
        balance: 0
      });
      await user.save();
      return await friend.save();
    },
    createTransaction: async (parent, args, context, info) => {

      try {
        const creator = await User.findById(args.creator);
        const txUsers = args.splitbw.filter(s => s.user != creator._id.toString()).map(s => s.user);
        const splits = {};

        args.splitbw.forEach((s) => {
          splits[s.user] = s.amount;
        })

        let t;
        if(args.group == "") {
            t = new Transaction({
              description: args.description,
              amount: args.amount,
              user: args.creator,
              type: args.type,
              currencyType: args.currencyType,
              splitbw: args.splitbw,
            })
        }
        else {
          t = new Transaction({
            description: args.description,
            amount: args.amount,
            user: args.creator,
            group: args.group,
            type: args.type,
            currencyType: args.currencyType,
            splitbw: args.splitbw,
          })
        }

        txUsers.forEach(async (userId) => {
          const user = await User.findById(userId);

          //update group balance
          if(args.group == ""){
            const nonExpenseGroup = user.groups[0];
            nonExpenseGroup.balance -= splits[userId];
          }
          else {
            for (let i = 0; i < user.groups.length; i++) {
              const group = user.groups[i];
              if (group.group_id.toString() == args.group ) {
                group.balance -= splits[userId];
                break;
              }
            }
          }
        
          //update creator friend balance
          for (let i = 0; i < user.friends.length; i++) {
            const friend = user.friends[i];
            if (friend.friend_id.toString() === creator._id.toString()) {
              friend.balance -= splits[userId];
              break;
            }
          }

          user.total_owed -= splits[userId];
          user.transactions.push(t._id);  // user who is involved in transaction
          await user.save();
          // console.log("Txuser",user);
        })

        //update creator group balance
        if(args.group == ""){
          const nonExpenseGroup = creator.groups[0];
          nonExpenseGroup.balance += splits[args.creator];
        }
        else {
          for (let i = 0; i < creator.groups.length; i++) {
            const group = creator.groups[i];
            if (group.group_id.toString() == args.group) {
              group.balance += splits[args.creator];
              break;
            }
          }
        }

        //update creator friends balance involved in transaction
        for (let i = 0; i < creator.friends.length; i++) {
          const friend = creator.friends[i];
          const fid = friend.friend_id.toString();
          if (txUsers.includes(fid)) {
            friend.balance += splits[fid];
          }
        }

        creator.total_owed += splits[args.creator];
        creator.transactions.push(t._id);  //  creator who is involved in transaction
        await t.save();
        await creator.save();
        // console.log("creator",creator);
        // console.log("Transaction",t);
        return t;
      } 
      catch (error) {
        console.log(error);
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
  console.log("Connected to database");
  startStandaloneServer(server, { listen: { port: process.env.PORT || 4000 } })
  .then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  });
})

// const { url } = await startStandaloneServer(server,
//   { listen: { port: process.env.PORT || 4000 } }
// )

// console.log(`🚀 Server ready at ${url}`)

