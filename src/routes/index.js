const newRouter = require('./news')
const siteRouter = require('./site')
const meRouter = require('./me')
const productsRouter = require('./products')
const usersRouter = require('./users')
const adminRouter = require('./admin')
const authRouter = require('./auth')
const cmtsRouter = require('./comments')

const authMiddleware = require('../app/middlewares/authMiddleware');
const DTO = require('../app/middlewares/DTO');

function route(app){
    app.use('/news', newRouter);
    app.use('/comments', authMiddleware, cmtsRouter);
    app.use('/auth', authRouter);
    app.use('/admin', authMiddleware, adminRouter);
    app.use('/users', authMiddleware, usersRouter);
    app.use('/products', authMiddleware, productsRouter);
    app.use('/me', authMiddleware, meRouter);
    app.use('/', authMiddleware, siteRouter);
}

module.exports = route;