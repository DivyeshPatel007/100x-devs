const mongoose = require('mongoose');

function connectDB() {
    mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log("<---------------- Database is connected ---------------->")
    }).catch((error) => {
        console.log("DB connection fail: ", error)
    })
}


module.exports = connectDB;



