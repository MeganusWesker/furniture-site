const mongoose = require('mongoose');


const connectDatabase = ()=>{
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DB_LOCAl_URI,{
      
    }).then(con =>{
        console.log(`Mongoose Database connnected with HOST:${con.connection.host}`);
    }).catch((error)=>{
         console.log(error.message);
    })
}

module.exports = connectDatabase;