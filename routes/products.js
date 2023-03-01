const express = require('express');
const router = express.Router();

const {getProducts,newProduct,getSingleProduct,updateProduct,deleteProduct, createProductReview,getProductReviews, deleteReview,getAdminProducts} = require("../controllers/productController");


const {isAuthenticatedUser,authorizeRoles} = require('../middlewares/userAuth');

// get all products route
router.route('/products').get(getProducts);
// get single product  by id route
router.route('/product/:id').get(getSingleProduct);

//admin routes
// create product route 
router.route('/admin/product/new').post(isAuthenticatedUser,authorizeRoles('admin'),newProduct);

router.route("/admin/products").get(isAuthenticatedUser,authorizeRoles('admin'),getAdminProducts)

// update product and delete product route
router.route('/admin/product/:id').put(isAuthenticatedUser,authorizeRoles('admin'),updateProduct).delete(isAuthenticatedUser,authorizeRoles('admin'),deleteProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteReview);

module.exports = router;