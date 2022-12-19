const express = require('express')
const router=express.Router()
const {createUser} = require('../Controllers/userController')


router.post('/register',createUser)


module.exports = router