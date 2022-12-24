const express = require('express')
const router=express.Router()
const {createuser,updateUser,Createproduct,updateProduct} = require('../Middleware/validations')
const auth=require('../Middleware/auth')
const {createUser,getUser,login,update} = require('../Controllers/userController')
const {createproduct,updateProductById,getproductById,deletedProduct,getproductbyquery} = require('../Controllers/productController')
const {createCart,updatecart,getCart,deleteCart}=require("../Controllers/cartController")
const {createOrder,updateOrder}=require("../Controllers/OrderController")



router.post('/register',createuser,createUser)
router.post('/login',login)
router.post('/products',Createproduct,createproduct)
router.post('/users/:userId/cart',auth.authentication,auth.authorization,createCart)

router.get('/user/:userId/profile',auth.authentication,getUser)
router.get('/products',getproductbyquery)
router.get('/products/:productId',getproductById)
router.get('/users/:userId/cart',auth.authentication,auth.authorization,getCart)

router.put('/user/:userId/profile',auth.authentication,auth.authorization,updateUser,update)
router.put('/products/:productId',updateProduct,updateProductById)
router.put('/users/:userId/cart',auth.authentication,auth.authorization,updatecart)


router.delete('/products/:productId',deletedProduct)
router.delete('/users/:userId/cart',auth.authentication,auth.authorization,deleteCart)

router.post("/users/:userId/orders",auth.authentication,auth.authorization,createOrder)
router.put("/users/:userId/orders",auth.authentication,auth.authorization,updateOrder)


module.exports = router