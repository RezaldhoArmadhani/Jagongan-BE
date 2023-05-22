const { addMessage, getMessage, updateMessage, deleteMessage } = require("../model/chat");
const commonHelper = require("../helper/common");
const { v4: uuidv4 } = require('uuid');

const chatController = {

    addMessage: async (req, res) => {
        try {
            const payload = req.payload
            const { id: id_user, type } = payload
            const { body, receiver_id } = req.body

            if (type != "access-token") {
                return commonHelper.response(res, [], 403, "TOKEN WRONG")
            }
            const id = uuidv4();
            const data = {
                id,
                body,
                sender_id: id_user,
                receiver_id
            }
            
            const { rowCount } = await addMessage(data)
            if (!rowCount) {
                return commonHelper.response(res, [], 401, 'failed add message')
            }
            commonHelper.response(res, data, 200, 'success add message')
            console.log(addMessage);
        } catch (error) {
            console.log(error)
            commonHelper.response(res, null, 500, 'error 500')
        }
    },

    getMessage: async (req, res) => {
        try {
            const receiver_id = req.params.receiver_id
            const { id: sender_id } = req.payload
            const { rows } = await getMessage({ sender_id, receiver_id })
            if (!rows) {
                return commonHelper.response(res, [], 500, 'get data failed')
            }
            const newData = rows.map((data) => {
                const date = new Date(data.time * 1000)
                const hours = date.getHours()
                const minutes = date.getMinutes()
                data.time = hours + ':' + minutes
                return data
            })
            commonHelper.response(res, newData, 200, 'get data success')
        } catch (error) {
            console.log(error);
            commonHelper.response(res, null, 500, 'Error 500')
        }
    },

    updateMessage: async (req, res) => {
        try {
            const id = req.params.id
            const {body} = req.body
            const { rowCount } = await updateMessage({id, body})
            if (!rowCount) {
              return commonHelper.response(res, [], 401, 'update failed')
            }
            return commonHelper.response(res, [] , 200, 'update success')
          } catch (error) {
            console.log(error)
          }
    },

    deleteMessage: async (req, res) => {
        try {
            const id = req.params.id
            const { rowCount } = await deleteMessage(id)
            if (!rowCount) {
              return commonHelper.response(res, [], 304, 'delete failed')
            }
            return commonHelper.response(res, [] , 200, 'delete success')
          } catch (error) {
            console.log(error)
            commonHelper.response(res, [], 500, 'Error 500')
          }
    }

};

module.exports = chatController;