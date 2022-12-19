const express = require('express')
const router=express.Router()
const {createUser,getUser,login,update} = require('../Controllers/userController')


router.post('/register',createUser)
router.post('/user/login',login)
router.get('/user/:userId/profile',getUser)
router.put('/user/:userId/profile',update)



module.exports = router