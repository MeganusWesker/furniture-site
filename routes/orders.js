const express = require('express');
const router = express.Router();



const {newOrder,getSingleOrder,myOrders,allOrders,updateOrder,deleteOrder } = require('../controllers/orderController');

const {isAuthenticatedUser,authorizeRoles} = require('../middlewares/userAuth');


// newOrder route /api/v1/order/new
router.route('/order/new').post(isAuthenticatedUser,newOrder);

// get single order /api/v1/order/:id
router.route('/order/:id').get(isAuthenticatedUser,getSingleOrder);

// get logged in users all orders /api/v1/orders/me
router.route('/orders/me').get(isAuthenticatedUser,myOrders);

// admin route get all orders  /api/v1/admin/orders
router.route('/admin/orders').get(isAuthenticatedUser,authorizeRoles('admin'),allOrders);

// admin route update order /delete /api/v1/admin/order/:id
router.route('/admin/order/:id')
            .put(isAuthenticatedUser,authorizeRoles('admin'),updateOrder)
            .delete(isAuthenticatedUser,authorizeRoles('admin'),deleteOrder);
            

module.exports = router;