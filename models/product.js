const mongoose = require('mongoose');


const productSchema =  mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter product name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"please enter product description"]
    },
    price:{
        type:Number,
        required:true,
        maxlength:[8,"price cannot be exceed from 8 characters"],
        default:0.0
    },
    rating:{
        type:Number,
        default:0
    },
    images:[
        {
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }
],
  
    category: {
        type: String,
        required: [true, "Please Enter Product Category"],
      },
      
   
    
    stock:{
        type:Number,
        required:[true,"please enter the stock of the item"],
        maxlength:[5,"stock cannot exceed more than 5 characters"],
        default:0
    },

    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:'User',
                required:true,
        
            },
 
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],

    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true,

    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("Product", productSchema);