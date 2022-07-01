const express = require('express');
const router = express.Router();

const newsController = require('../app/controllers/NewsCotroller')
const authMiddleware = require('../app/middlewares/authMiddleware');
const multer  = require('multer');

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

router.post('/stored', upload.single('img'), newsController.create)
router.delete('/:id/delete', newsController.destroy);
router.get('/', authMiddleware, newsController.index)

module.exports = router
