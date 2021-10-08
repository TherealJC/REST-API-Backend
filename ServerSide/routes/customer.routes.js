const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuth.controller'); // import controls to verify admin account (for route protection)
const customerController = require('../controllers/customer.controllers');
const { verifyAccessToken } = require('../configs/jwt.config')

router.get('/', function (req, res) {
    res.send('Please append a route after /customer.Routes: /signup, /login, /refresh-token, /logout, /category, /product, /cart,, /cartDetails /orders')
});

router.post('/signup', customerAuthController.registerCustomerAccount);
router.post('/login', customerAuthController.customerLogin);
router.post('/refresh-token', verifyAccessToken, customerAuthController.customerRefreshTokens);
router.delete('/logout', verifyAccessToken, customerAuthController.customerLogout);

router.get('/product', customerController.getAllProducts);
router.get('/product/:id', customerController.viewSingleProduct);
router.get('/category', customerController.getAllCategories);
router.post('/category', customerController.viewItemsByCategory);

router.post('/customer-details', verifyAccessToken, customerController.postCustomerDetails)
router.get('/customer-details/:id', verifyAccessToken, customerController.getCustomerDetails)
router.put('/customer-details/:id', verifyAccessToken, customerController.editCustomerDetails)
router.delete('/customer-details/:id', verifyAccessToken, customerController.deleteCustomerDetails)

router.put('/account/', verifyAccessToken, customerController.editAccount)
router.delete('/account/', verifyAccessToken, customerController.deleteAccount)

router.get('/add-to-cart/:id', verifyAccessToken, customerController.addItemToCart);
router.delete('/remove-from-cart/:id', verifyAccessToken, customerController.removeItemFromCart);
router.get('/cartInfo', verifyAccessToken, customerController.currentCartDetails);

router.get('/create-order', verifyAccessToken, customerController.placeOrder);
router.get('/order/:id', verifyAccessToken, customerController.getSingleOrder);
router.get('/orders', verifyAccessToken, customerController.getAllOrders);


module.exports = router;
