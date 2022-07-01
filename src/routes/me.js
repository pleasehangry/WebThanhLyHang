const express = require('express');
const router = express.Router();
const authMiddleware = require('../app/middlewares/authMiddleware');

const meController = require('../app/controllers/MeCotroller')

router.get('/stored/products', meController.storedProducts)
router.get('/trash/products', meController.trashProducts)
router.get('/cart/products', meController.cartProducts)
router.get('/order-Status', meController.orderStatus)
router.get('/orders', meController.orders)
router.post('/addCartProduct', meController.addCartProduct)
router.post('/addOrder', meController.addOrder)
router.delete('/hideFromCart/:id/force', meController.hideFromCart)
router.delete('/:id/deleteOrder', meController.DeleteOrder)
router.post('/handle-form-actions', meController.handleFormActions)
router.get('/watingBought/products', meController.watingBoughtProducts)

module.exports = router
