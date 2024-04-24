
export const typeDefs =`#graphql

    type User {
        id: ID!,
        name: String!,
        imageUrl: String,
        friends: [User],
        contact: String,
        total_owed: Int!,
        transactions: [Transaction!]
        groups: [Group!]
    },

    type Group {
        id: ID!,
        users: [User!]!
        imageUrl: String,
        name: String!,
        type: GroupType!
        transactions: [Transaction!]
    }

    type Transaction {
        id: ID!,
        amount: Int!,
        description: String,
        date: String!,
        user: User!,
        group: Group!
        type: TransactionType!
        currencyType: CurrencyType!
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