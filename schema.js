
export const typeDefs =`#graphql
    scalar Date
    type User {
        _id: ID!,
        name: String!,
        email: String!,
        password: String!,
        phoneNo: String,
        imageUrl: String,
        friends: [User],
        contact: String,
        total_owed: Int!,
        transactions: [Transaction!]
        groups: [UserGroupByBalance]
        isVerified: Boolean
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },

    type Group {
        _id: ID!,
        balancePerUser: [balancePerUser],
        imageUrl: String,
        name: String!,
        type: GroupType!
        transactions: [Transaction!]
    }

    type Transaction {
        _id: ID!,
        amount: Float!,
        description: String!,
        created_at: Date,
        user: User!,
        group: Group!
        type: TransactionType!
        currencyType: CurrencyType!
        splitbw: [splitbw]
    }

    type balancePerUser {
        user: User,
        balance: Float
    }

    type splitbw {
        user: User,
        amount: Float
    }

    type UserGroupByBalance {
        group: Group,
        balance: Int
    }


    enum GroupType {
        Trip,
        House,
        Friend,
        Other
    }

    enum TransactionType {
        equally,
        custom,
        percentage
    }

    enum CurrencyType {
        INR,
        USD,
        EUR,
        GBP
    }

    type Query {
        user(id: ID!): User,
        group(id: ID!): Group,
        transaction(id: ID!): Transaction
        getExpenseFeed(groupId: ID!,userId: ID!): ExpenseFeed
    }
    type Mutation {
        createUser(name: String!, email: String!, password: String!, phoneNo: String, imageUrl: String): User,
        updateUser(id:ID!, edits: EditUserInput!): User
        createGroup(name: String!, type: GroupType!, admin: ID!, imageUrl: String): Group,
        addGroupMember(groupId: ID!, userIds: [ID!]!): Group,
        addFriend(id: ID!, friendId: ID!): User,
        createTransaction(amount: Float!, description: String!, user: ID!, group: ID!, type: TransactionType!, currencyType: CurrencyType!, splitbw: [splitbwInput]): Transaction
    }

    type ExpenseFeed {
        edges: [EDGE!]
    }

    # type VAL {
    #     user: User,
    #     balance: Int
    # }

    type EDGE {
        from: String,
        to: String,
        label: String
    }


    input EditUserInput {
        phoneNo: String,
        imageUrl: String,
        contact: String,
    }

    input splitbwInput {
        user: ID!,
        amount: Float!
    }
`;

// group balance of user -> function