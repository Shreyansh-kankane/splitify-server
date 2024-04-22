// import { ApolloServer } from "@apollo/server"
// import { startStandaloneServer } from "@apollo/server/standalone"

// const typeDefs =`#graphql

//   type User {
//     _id: ID!
//     username: String!
//     email: String!
//   }

//   type Query {
//     getUser(_id: ID!): User
//     getAllUsers: [User]
//   }

//   type Mutation {
//     createUser(username: String!, email: String!): User
//     updateUser(_id: ID!, username: String, email: String): User
//     deleteUser(_id: ID!): User
//   }
// `;

// const users = [
//   { _id: "1", username: "john_doe", email: "john@example.com" },
//   { _id: "2", username: "jane_smith", email: "jane@example.com" },
// ];


// const resolvers = {
//   Query: {
//     getUser: (parent, { _id }) => users.find(user => user._id === _id),
//     getAllUsers: () => users,
//   },
//   Mutation: {
//     createUser: (parent, { username, email }) => {
//       const newUser = { _id: String(users.length + 1), username, email };
//       users.push(newUser);
//       return newUser;
//     },
//     updateUser: (parent, { _id, username, email }) => {
//       const user = users.find(user => user._id === _id);
//       if (user) {
//         user.username = username || user.username;
//         user.email = email || user.email;
//         return user;
//       }
//     },
//     deleteUser: (parent, { id }) => {
//       const index = users.findIndex(user => user._id === _id);
//       if (index !== -1) {
//         return users.splice(index, 1)[0];
//       }
//     },
//   },
// };
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// })

// const { url } = await startStandaloneServer(server)

// console.log(`🚀 Server ready at ${url}`)


const expenditures =  [{   
    id: 1,
    paidBy: 'John Doe',
    amount: 100,
    shortDesc: 'Barbeque',
    participants: ['John Doe', 'Alex', 'John Smith'],
    date: '2024-01-22T11:21:18.432Z'
},
{
    id: 1,
    paidBy: 'John Doe',
    amount: 100,
    shortDesc: 'Barbeque',
    participants: ['John Doe', 'Alex', 'John Smith'],
    date: '2024-02-22T11:21:18.432Z'
},

{
    id: 2,
    paidBy: 'John Smith',
    amount: 200,
    shortDesc: 'Backery',
    participants: ['John Doe', 'Alex', 'John Smith'],
    date: '2024-02-22T11:21:18.432Z'
},
{
    id: 3,
    paidBy: 'Alex',
    amount: 600,
    shortDesc: 'Cafe',
    participants: ['John Doe','Alex','John Smith'],
    date: '2024-02-22T11:21:18.432Z'
}
]

const formattedExpenditures = {};

for(let i=0; i<expenditures.length; i++){
const date = new Date(expenditures[i].date).toDateString();
const month = date.toLocaleString('default', { month: 'long' });
console.log(month);
if(formattedExpenditures[date]){
    formattedExpenditures[date].push(expenditures[i]);
} else {
    formattedExpenditures[date] = [expenditures[i]];
}
}

console.log(formattedExpenditures);