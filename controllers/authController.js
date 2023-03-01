const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const User = require('../models/user');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');


exports.registerUser = catchAsyncErrors(async (req,res,next)=>{


    
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:"avatars",
        width:150,
        crop:'scale'
    })

   
   const {name,email,password} = req.body;

   

   const user = await User.create({
       name,
       email,
       password,
       avatar:{
           public_id:myCloud.public_id,
           url:myCloud.secure_url
       },
   });

sendToken(user,200,res)

});

// login user => api/v1/login


exports.loginUser = catchAsyncErrors(async ( req,res,next)=>{
    const {email,password} = req.body;

     // checks email and password entered by user or not 
    if(!email || !password){
        return next(new ErrorHandler('please enter email & password',400));
    }
     // finding user in database 
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorHandler('incorrect email or password',400));
    }

    // comparing password created method in user model 
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler('incorrect email or password',400));
    }
    
    sendToken(user,200,res)
});


//logout user api/v1/logout

exports.logout = catchAsyncErrors(async (req,res,next)=>{
      res.cookie('token',null,{
            httpOnly:process.env.NODE_ENV === "Development" ? false : true,
            secure:process.env.NODE_ENV === "Development" ? false : true,
            sameSite:process.env.NODE_ENV === "Development" ? false : "none",
            expires:new Date(Date.now())
      });

      res.status(200).json({
       success:true,
       message:'logged out'
      });
});

// forgot password 

exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{

      const user = await User.findOne({email:req.body.email});
      if(!user){
          return next(new ErrorHandler('user not found',404));
      }

      // Get ResetPassword

     const resetToken =  user.getResetPasswordToken();

     await user.save({validateBeforeSave:false});

     const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
      
     const message = `your password reset token is temp \n\n ${resetPasswordUrl} \n\n please ignore if you  not requested for password reset`

     try {
         
        await sendEmail({
             email:user.email,
             subject:`password reset token `,
             message,
            });

        res.status(200).json({
            success:true,
            message:`email sent to ${user.email} succesfully`
        })


     } catch (error) {
         user.resetPasswordToken = undefined;
         user.resetPasswordExprie = undefined;

         
         await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500));
     }
});

// reseting password
exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{
    // geting token from url (params) and hashing 

 
 
    const resetPasswordToken= crypto.createHash('sha256').update(req.params.token).digest('hex');



    const user = await User.findOne({
        resetPasswordToken,
       resetPasswordExprie:{$gt:Date.now()}
    });


  
      if(!user){
          return next(new ErrorHandler('reset password token is invalid or has been expired',404));
      }
      
      if(req.body.password!== req.body.confirmPassword){
        return next(new ErrorHandler('password does not match',404));
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExprie = undefined;

     await user.save();

     sendToken(user,200,res);
});

// get user details 

exports.getUserDetails = catchAsyncErrors(async (req,res,next)=>{
    
    const user = await User.findById(req.user.id);

       res.status(200).json({
           success:true,
           user
       });
});


// update / change password => /api/v1/password/update

exports.updatePassword = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }
  
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("password does not match", 400));
    }
  
    user.password = req.body.newPassword;
  
    await user.save();
  
    sendToken(user, 200, res);
});

// update profile of user 
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
   const usersNewData = {
       email:req.body.email,
       name:req.body.name,
      
   }

   if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    usersNewData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

 

   const user = await User.findByIdAndUpdate(req.user.id,usersNewData,{
       new:true,
       runValidators:true,
       useFindAndModify:false
   });
   
   res.status(200).json({
       success:true,
       user
   })
});

// admin routes

// get all user => /api/v1/admin/users

exports.allUsers = catchAsyncErrors(async (req,res,next)=>{
    const users =  await User.find();

    res.status(200).json({
        success:true,
        users
    });
});

// get one user => /api/v1/admin/user/:id
exports.getUser = catchAsyncErrors(async (req,res,next)=>{
   
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler('user not found ',404));
    }

    res.status(200).json({
       success:true,
       user
    });

});


// update user admin route => /api/v1/admin/user/:id

exports.updateUser = catchAsyncErrors(async(req,res,next)=>{
    const usersNewData = {
        email:req.body.email,
        name:req.body.name,
        role:req.body.role
    }
 
    const user = await User.findByIdAndUpdate(req.params.id,usersNewData,{
        new:true,
        runValidators:true,
        useFindAndModify:true
    });

    if(!user){
        return next(new ErrorHandler("user not found ",404))
    }
    
    res.status(200).json({
        success:true
        
    })
 });

 // delete user admin route /api/v1/admin/user/:id

 exports.deleteUser = catchAsyncErrors(async (req,res,next)=>{


   
    const user = await User.findById(req.params.id);



    if(!user){
        return next(new ErrorHandler('user not found',404));
    }

  

    const imageId = user.avatar.public_id;

    console.log(imageId);

    

   const data= await cloudinary.v2.uploader.destroy(imageId);



   console.log(data)
    

    await user.remove();

    console.log("chal toh geya hai bhenchod")

    res.status(200).json({
       success:true,
       message:"user has been deleted"
    });

});