
export const typeDefs =`#graphql
    scalar Date
    type User {
        _id: ID!,
        name: String!,
        email: String!,
        password: String,
        phoneNo: String,
        imageUrl: String,
        contact: String,
        total_owed: Float!,
        friends: [UserFriend!],
        groups: [UserGroup!]
        transactions: [Transaction!]
        isVerified: Boolean
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },

    type UserFriend {
        friend: User,
        balance: Float
    }

    type UserGroup {
        group: Group,
        balance: Float
    }

    type Group {
        _id: ID!,
        name: String!,
        imageUrl: String,
        admin: User!,
        users: [User!],
        type: GroupType!
        currencyType: CurrencyType!
        # transactions: [Transaction!]
    }

    enum GroupType {
        Trip,
        House,
        Friend,
        Other
    }

    enum CurrencyType {
        INR,
        USD,
        EUR,
        GBP
    }

    type Transaction {
        _id: ID!,
        amount: Float!,
        description: String!,
        user: User!,
        group: Group
        type: TransactionType!
        currencyType: CurrencyType!
        splitbw: [splitbw]
        created_at: Date,
    }

    enum TransactionType {
        equally,
        custom,
        percentage
    }

    type splitbw {
        user: User,
        amount: Float
    }

    type Query {
        user(id: ID!): User,
        group(id: ID!): Group,
        transaction(id: ID!): Transaction
        getExpenseFeed(groupId: ID!): ExpenseFeed,
    }
    type Mutation {
        createUser(name: String!, email: String!, password: String!, phoneNo: String, imageUrl: String): User,
        createUserWithGoogleSignIn(name: String!, email: String!,imageUrl: String): User,
        updateUser(id:ID!, edits: EditUserInput!): User
        updateUserPassword(id: ID!, password: String!, token: String!): User,
        addFriend(id: ID!, friendId: ID!): User,
        createGroup(name: String!, type: GroupType!, admin: ID!, currencyType: CurrencyType, imageUrl: String): Group,
        addGroupMember(groupId: ID!, userIds: [ID!]!): Group,
        createTransaction(amount: Float!, description: String!, creator: ID!, group: ID, type: TransactionType!, currencyType: CurrencyType!, splitbw: [splitbwInput]): Transaction

    }

    type ExpenseFeed {
        edges: [EDGE!],
        nodes: [VAL!]
    }

    type VAL {
        user: String,
        balance: Float
    }

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