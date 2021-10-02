const { addItem } = require('../controllers/itemController')

const router = require('express').Router()

router
    .route('/add-item')
    .post(addItem)


module.exports = router