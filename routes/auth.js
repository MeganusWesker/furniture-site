const express = require('express');
const { registerUser,
        loginUser,
        logout,
        forgotPassword,
        resetPassword,
        getUserDetails,
        updatePassword,
        updateProfile,
        allUsers,
        getUser,
        updateUser,
        deleteUser } = require('../controllers/authController');

const router = express.Router();

const {isAuthenticatedUser,authorizeRoles} = require('../middlewares/userAuth');

// register route
router.route('/register').post(registerUser);

//login user route
router.route('/login').post(loginUser);

// update or change password 
router.route('/password/update').put(isAuthenticatedUser,updatePassword);

// update profile or change profile
router.route('/profile/update').put(isAuthenticatedUser,updateProfile)

// forgotPassword
router.route('/password/forgot').post(forgotPassword);

//resetPassword
router.route('/password/reset/:token').put(resetPassword);

// logout user route
router.route('/logout').get(logout);

// get your profile detail
router.route('/me').get(isAuthenticatedUser,getUserDetails);


// admin routes

// get all users admin 
router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles('admin'),allUsers);

// get one user's detail
router.route('/admin/user/:id')
          .get(isAuthenticatedUser,authorizeRoles('admin'),getUser)
          .put(isAuthenticatedUser,authorizeRoles('admin'), updateUser)
          .delete(isAuthenticatedUser,authorizeRoles('admin'), deleteUser)
         

module.exports = router;