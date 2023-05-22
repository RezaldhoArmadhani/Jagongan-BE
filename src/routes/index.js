const express = require('express')
const router = express.Router()
const usersRoutes = require('../routes/users')
const chatsRoutes = require('../routes/chat')

// const chatRoutes = require('../routes/chat')


router.use('/', usersRoutes)
router.use('/message', chatsRoutes)


module.exports = router;