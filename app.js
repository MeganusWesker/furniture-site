const express= require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors =require('cors');
const errorMidddleware = require("./middlewares/error");


// setting up config file
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "config/config.env" });
}

app.use(express.json({limit:"50mb"}));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.urlencoded({limit:"50mb",extended:true}))


app.use(
    cors({
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      origin: [process.env.FRONTEND_URI_1, process.env.FRONTEND_URI_2],
    })
);



//app.use(bodyParser.urlencoded({extended:true}))

// Importing all routes 
const products = require('./routes/products');
const user = require('./routes/auth');
const order = require('./routes/orders');
const payment = require("./routes/paymentRoute");



app.use('/api/v1',products);
app.use('/api/v1',user);
app.use('/api/v1',order);
app.use('/api/v1',payment);



app.get("/",(req,res)=>{
    res.send("working");
});


//middleware to handle errors
app.use(errorMidddleware);

module.exports = app;