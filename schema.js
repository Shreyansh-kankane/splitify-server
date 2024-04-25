
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
        amount: Int!,
        description: String,
        created_at: Date,
        user: User!,
        group: Group!
        type: TransactionType!
        currencyType: CurrencyType!
        splitbw: [splitbw]
    }

    type balancePerUser {
        user: User,
        balance: Int
    }

    type splitbw {
        user: User,
        amount: Int
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
        custom
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
    }
`;

// group balance of user -> function