const express = require('express');
const router = express.Router();
const multer  = require('multer');

const productsController = require('../app/controllers/ProductsController')

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './src/public/uploads')
    },
    filename: function(req, file, cb){
        cb(null,Date.now() + file.originalname) 
    }
})

const upload = multer({
    storage: storage,
    limits:{
        fieldSize: 1024*1025*5
    }
}) 

router.get('/create', productsController.create)
router.post('/store',upload.single('img'), productsController.store)
router.get('/:id/edit', productsController.edit)
router.post('/handle-form-actions', productsController.handleFormActions)
router.put('/:id', upload.single('img'), productsController.update)
router.patch('/:id/restore', productsController.restore)
router.patch('/:id/check', productsController.check)
router.delete('/:id/force', productsController.forceDestroy)
router.delete('/:id', productsController.destroy)
router.get('/:slug', productsController.show)

module.exports = router
