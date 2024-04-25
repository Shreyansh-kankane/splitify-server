const users = [
    {
        _id: "1",
        name: "John Doe",
        imageUrl: "https://randomuser.me/api/port",
        contact: "1234567890",
        total_owed: 0,
        friends: ["2","3"],
        transactions: [],
        balanceByGroup: [ {
            group_id: "1",
            balance: "200"
        },{
            group_id: "2",
            balance: "100"
        } ]
    },
    {
        _id: "2",
        name: "Jane",
        imageUrl: "https://randomuser.me/api/port",
        contact: "1234567890",
        total_owed: 0,
        friends: ["1"],
        transactions: [],
        balanceByGroup: [ {
            group_id: "2",
            balance: "11"
        } ]
    },
    {
        _id: "3",
        name: "Alice",
        imageUrl: "https://randomuser.me/api/port",
        contact: "1234567890",
        total_owed: 0,
        friends: ["1"],
        transactions: [],
        balanceByGroup: [ {
            group_id: "1",
            balance: "23"
        } ]
    },

]   


const groups = [
    {
        _id: "1",
        name: "Trip",
        imageUrl: "https://randomuser.me/api/port",
        type: "Trip"
    },
    {
        _id: "2",
        name: "House",
        imageUrl: "https://randomuser.me/api/port",
        type: "House"
    }
]

const transactions = [

    {
        _id: "1",
        amount: 100,
        description: "Trip to Jammu",
        date: "2021-05-01",
        user_id: "1",
        group_id: "1",
        type: "equally",
        currencyType: "INR",
        splitbw: [{
            "user": "1",
            "amount": "50"
        }]
    },
    {
        _id: "2",
        amount: 100,
        description: "Trip to Goa",
        date: "2021-05-01",
        user_id: "2",
        group_id: "1",
        type: "equally",
        currencyType: "INR",
        splitbw: [{
            "user": "2",
            "amount": "50"
        }]
    }
]

export default { users, groups, transactions}

//  "$oid": "662aa202fb64f5d86b933509"