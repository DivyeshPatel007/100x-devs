const dotenv = require("dotenv")
dotenv.config()
const cors = require('cors');
const express = require("express");

const authRouter = require("./routes/authRoute");
const connectDB = require("./config/db");
const roleModel = require("./models/roleModel");

const app = express();
const PORT = process.env.PORT

// DB connection
connectDB()


// Middleware
app.use(express.json());
app.use(cors())


// Routes
app.use("/api/v1/auth", authRouter)





app.listen(PORT, () => {
    console.log(`Server is up and running at port:${PORT} http://localhost:${PORT}`)
})