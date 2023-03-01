const app = require('./app');
const cloudinary = require('cloudinary');
const connectDatabase = require('./config/database');


// Handle the uncaught exceptions

process.on('uncaughtException',err=>{
    console.log(`Error: ${err.stack}`);
    console.log('shuting down due to uncaught exception');
    process.exit(1);
})



// setting up config file
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" });
  }


// connecting to database
connectDatabase();

cloudinary.config({

  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET


});

const server = app.listen(process.env.PORT, ()=>{
    console.log(`server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});


//handle unhandled promise rejections
process.on('unhandledRejection',err=>{
    console.log(`Error:${err.message}`);
    console.log('shuting down the server down the server due to unhandled promise rejection');
    server.close(()=>{
        process.exit(1);
    })
})