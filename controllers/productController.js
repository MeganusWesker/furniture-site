const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');
const cloudinary = require("cloudinary");

// create new product => /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async (req,res,next)=>{
      let images = [];

      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else {
        images = req.body.images;
      }

    

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });

        

        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

  

      req.body.images = imagesLinks;
      req.body.user = req.user.id;


  
    const product = await Product.create(req.body);

    
    res.status(201).json({
        success:true,
        product
    })
})


// get all products => /api/v1/products
exports.getProducts = catchAsyncErrors( async (req,res,next)=>{

    const resultPerPage =8;


    const productCount = await Product.countDocuments();

    const apiFeatures = new ApiFeatures(Product.find(),req.query)
                       .search()
                       .filter()
                       .pagination(resultPerPage);


    let products = await apiFeatures.query;

    let filteredProductsCount = products.length+1;

    products = await apiFeatures.query.clone();

  res.status(200).json({
      success:true,
      count:products.length,
      products,
      productCount,
      resultPerPage,
      filteredProductsCount
  });
})

// get all admin products => /api/v1/admin/products
exports.getAdminProducts = catchAsyncErrors( async (req,res,next)=>{

  const products = await Product.find()

   
  res.status(200).json({
      success:true,
      products
  });
})

//get all single product detail => /api/v1/product:id

exports.getSingleProduct = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.params.id);

    
     
    if(!product){
      return next(new ErrorHandler('Product not found', 404));
     }


    res.status(200).json({
        success:true,
        product
    })
})

// update product by id => /api/v1/product:id

exports.updateProduct = catchAsyncErrors(async (req,res,next)=>{
   let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }
   
    
  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindModify:false
    });

    res.status(200).json({
        success:true,
        product
    })
    
})

// Delete product => /api/v1/admin/product/:id

exports.deleteProduct = catchAsyncErrors(async (req,res,next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }


          // Deleting Images From Cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }
   
    await product.remove();

    res.status(200).json({
        success:true,
    })
})

// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);

  
    const isReviewed = product.reviews.find( (rev) => 
      rev.user.toString() === req.user._id.toString()
    );
  
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    let avg = 0;
  
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    product.rating = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  });
  
  // Get All Reviews of a product
  exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  });
  
  // Delete Review
  exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });