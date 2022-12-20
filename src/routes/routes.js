const express = require('express')
const router=express.Router()
const {createuser,updateUser} = require('../Middleware/validations')
const auth=require('../Middleware/auth')
const {createUser,getUser,login,update} = require('../Controllers/userController')


router.post('/register',createuser,createUser)
router.post('/login',login)
router.get('/user/:userId/profile',auth.authentication,getUser)
router.put('/user/:userId/profile',auth.authentication,update)



module.exports = router