const Product = require('../models/Product')
const Comment = require('../models/Comment')
const User = require('../models/User')
const Category = require('../models/Category')
const Order = require('../models/Order')
const OrderDetail = require('../models/OrderDetail')
const { mitipleMongooseToObject, mongooseToObject} = require('../../util/mongoose')
class ProductsController {
    //[GET] /product/:slug
    show(req, res, next){
        Product.findOne({ slug: req.params.slug})
            .then(product => {
                return Category.findOne({slug: product.category})
                    .then(category => {
                        return {
                            category: mongooseToObject(category),
                            product: mongooseToObject(product),
                        }
                    })
                
            })
            .then((data) => {
                return User.findById(data.product.userId)
                    .then(user => {
                        return {
                            user: mongooseToObject(user),
                            product: data.product,
                            category: data.category,
                        }
                    })
            })
            .then((data) => {
                return Comment.find({productId: data.product._id})
                    .then(comments => {
                        comments = mitipleMongooseToObject(comments)
                        comments.forEach(function(comment){
                            User.findById(comment.userId)
                                .then(user => {
                                    user = mongooseToObject(user)
                                    Object.assign(comment, {
                                        userName: user.name,
                                        userAvat: user.avatar,
                                        userSlug: user.slug
                                    })
                                })
                        })
                        return {
                            user: data.user,
                            product: data.product,
                            category: data.category,
                            comments
                        }
                    })
            })
            .then(data => {
                console.log(data)
                res.render('products/show',{
                    data
                })
            })
            .catch(next)
    }
    //[GET] /product/create 
    create(req, res, next){
        res.render('products/create')
    }
    //[POST] /product/store 
    store(req, res, next){
        req.body.img = req.file.filename;
        req.body.isChecked = false;
        req.body.userId = req.cookies.userId;
        const formdata = req.body;
        const product = new Product(formdata)
        product
            .save()
            .then(() => res.redirect("/me/stored/products"))
            .catch((error) => {})
        
    }
    //[POST] /product/:id/edit 
    edit(req, res, next){
        Product.findById(req.params.id)
            .then(product => res.render('products/edit', {
                product: mongooseToObject(product)
            }))
            .catch(next)
    }
    //[Put] /product/:id 
    update(req, res, next) {
        if(!req.body.filename){
            User.findOne({_id: req.params.id})
                .then(user => {
                    req.body.avatar = user.avatar
                })
        }
        else{
            req.body.avatar = req.file.filename;
        }
        Product.updateOne({_id: req.params.id}, req.body)
            .then(() => res.redirect("/me/stored/products"))
            .catch(next)
    }
    //[Delete] /product/:id
    destroy(req, res, next) {
        var arr = []
        OrderDetail.find({productId: req.params.id})
            .then( ODs => {
                ODs.forEach(OD => arr.push(OD._id))
                Promise.all([Product.delete({_id: req.params.id}),
                    OrderDetail.deleteMany({_id: {$in: arr}}),
                    Order.deleteMany({orderDetailId: {$in: arr}})])
                    .then(() => res.redirect("back"))
                    .catch(next)
            })
            .catch(next)
    }
    //[Delete] /product/:id/force
    async forceDestroy(req, res, next) {
        await Product.deleteOne({_id: req.params.id})
            .then(() => res.redirect("back"))
            .catch(next)
    }
    //[Patch] /product/:id/restore
    restore(req, res, next) {
        Product.restore({_id: req.params.id})
            .then(() => res.redirect("back"))
            .catch(next)
    }
    //[Patch] /product/:id/check
    check(req, res, next) {
        Product.updateOne({_id: req.params.id}, {isChecked: true})
            .then(() => res.redirect("back"))
            .catch(next)
    }

    //[POST] /product/handleFormActions
    handleFormActions(req, res, next) {
        switch(req.body.action){
            case 'delete':
                OrderDetail.find({productId: {$in: req.body.productsIds}})
                    .then(ODs => {
                        const arr = ODs.map(od => arr.push(od._id))
                        Promise.all([Product.delete({_id: {$in: req.body.productsIds}}),
                        OrderDetail.deleteMany({_id: {$in: arr}}),
                        Order.deleteMany({orderDetailId: {$in: arr}})])
                            .then(() => res.redirect("back"))
                            .catch(next)
                    })
                    .catch(next)
                break
            case 'forceDelete':
                Product.deleteMany({_id: {$in: req.body.productsIds}})
                .then(() => res.redirect("back"))
                .catch(next)
            case 'restore':
                Product.restore({_id: { $in: req.body.productsIds }})    
                .then(() => res.redirect("back"))
                .catch(next)
                break
            case 'check':
                Product.updateMany({_id: { $in: req.body.productsIds }}, {isChecked: true})
                .then(() => res.redirect("back"))
                .catch(next)
                break
            default:
                res.json({message: "Action is invalid"})
        }
    }

}

module.exports = new ProductsController;
