require("dotenv").config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const connectDB = require("./server/config/db");
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require("express-session");
const imageRoutes = require("./server/routes/imageRoutes");


const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));


app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.use("/", imageRoutes);

app.use(require("./server/routes/main"));
app.use(require("./server/routes/admin"));

console.log('Using port:', PORT);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });