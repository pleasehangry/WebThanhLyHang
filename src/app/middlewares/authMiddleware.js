const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const OrderDetail = require("../models/OrderDetail");
const {
    mitipleMongooseToObject,
    mongooseToObject,
} = require("../../util/mongoose");

module.exports = async function requireLogin(req, res, next) {
    if (!req.cookies.userId) {
        res.redirect("/auth/login");
        return;
    }
    User.findOne({ _id: req.cookies.userId }, function (err, user) {
        if (!user) {
            res.redirect("/auth/login");
            return;
        }
        res.locals.user = mongooseToObject(user);
    });
    //muon tam ham de do du lieu vao header
    Category.find({}, function (err, categories) {
        if (categories) {
            res.locals.categories = mitipleMongooseToObject(categories);
        }
    });
    next();
};
