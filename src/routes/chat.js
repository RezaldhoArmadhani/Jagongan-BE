const express = require('express');
const router  = express.Router();
const chatController = require('../controller/chat');
const {protect} = require('../middleware/Auth');


router.post('/add', protect, chatController.addMessage);
router.get('/:receiver_id' , protect , chatController.getMessage)
router.put('/:id', protect, chatController.updateMessage)
router.delete('/:id', protect , chatController.deleteMessage)

module.exports = router;