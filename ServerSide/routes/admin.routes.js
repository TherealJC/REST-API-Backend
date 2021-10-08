// File contains routes for admin accounts
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminAuthController = require('../controllers/adminAuth.controller');
const { adminVerifyAccessToken } = require('../configs/jwt.config');

router.get('/', adminVerifyAccessToken, function (req, res) {res.send('Admin Area')});

// Own Account
router.post('/account', adminAuthController.adminCreateAccount ); // * Verify admin access turned off to allow for postman documentation testing (turn back on later)
router.post('/login', adminAuthController.adminLogin);
router.post('/refresh-token', adminVerifyAccessToken, adminAuthController.adminRefreshTokens);
router.delete('/logout', adminVerifyAccessToken, adminAuthController.adminLogout);

// All/any accounts
router.get('/account', adminVerifyAccessToken, adminController.getAllAccounts);
router.get('/account/:id', adminVerifyAccessToken, adminController.getSingleAccount);
router.put('/account/:id', adminVerifyAccessToken, adminController.editAccount);
router.delete('/account/:id', adminVerifyAccessToken, adminController.deleteAccount);

// Category
router.get('/category', adminVerifyAccessToken, adminController.getAllCategories);
router.post('/category/:id', adminVerifyAccessToken, adminController.viewItemsByCategory)
router.post('/category', adminVerifyAccessToken, adminController.addNewCategory);
router.put('/category/:id', adminVerifyAccessToken, adminController.editCategory);
router.delete('/category/:id', adminVerifyAccessToken, adminController.deleteCategory);

// Products
router.get('/product', adminVerifyAccessToken, adminController.getAllProducts);
router.get('/product/:id', adminVerifyAccessToken, adminController.getSingleProduct);
router.post('/product', adminVerifyAccessToken, adminController.createNewProduct);
router.put('/product/:id', adminVerifyAccessToken, adminController.editProduct);
router.delete('/product/:id', adminVerifyAccessToken, adminController.deleteProduct);

// Customer
router.get('/customer', adminVerifyAccessToken, adminController.getAllCustomers);
router.get('/customer/:id', adminVerifyAccessToken, adminController.getSingleCustomer);
router.post('/customer', adminVerifyAccessToken, adminController.createNewCustomer);
router.put('/customer/:id', adminVerifyAccessToken, adminController.editCustomer);
router.delete('/customer/:id', adminVerifyAccessToken, adminController.deleteCustomer);

// Cart
router.get('/cart', adminVerifyAccessToken, adminController.getAllCarts);
router.post('/cart', adminVerifyAccessToken, adminController.createNewCart);
router.get('/add-to-cart/:id', adminVerifyAccessToken, adminController.addItemToCart);
router.delete('/remove-from-cart/:id', adminVerifyAccessToken, adminController.removeItemFromCart);
router.put('/cart/:id', adminVerifyAccessToken, adminController.editCart);
router.delete('/cart/:id', adminVerifyAccessToken,adminController.deleteCart);
router.get('/cart-details/:id', adminVerifyAccessToken, adminController.getAnyCart);

// Orders
router.get('/order', adminVerifyAccessToken, adminController.getAllOrders);
router.get('/order/:id', adminVerifyAccessToken, adminController.getSingleOrder);
router.post('/order', adminVerifyAccessToken, adminController.createNewOrder);
router.put('/order/:id', adminVerifyAccessToken, adminController.editOrder);
router.delete('/order/:id', adminVerifyAccessToken, adminController.deleteOrder);

module.exports = router;