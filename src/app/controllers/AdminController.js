const User = require("../models/User");
const Product = require("../models/Product");
const {
  mitipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");
class AdminController {
  //[GET] / admin/stored/User
  storedUsers(req, res, next) {
    let userQuery = User.find({});
    if (req.query.hasOwnProperty("_sort")) {
      userQuery = userQuery.sort({
        [req.query.column]: req.query.type,
      });
    }
    Promise.all([userQuery, User.countDocumentsDeleted()])
      .then(([users, deletedCount]) =>
        res.render("admin/storedUsers", {
          deletedCount,
          users: mitipleMongooseToObject(users),
        })
      )
      .catch(next);
  }
  //[GET] / admin/trash/User
  trashUsers(req, res, next) {
    User.findDeleted({})
      .then((users) =>
        res.render("admin/RemovedUsers", {
          users: mitipleMongooseToObject(users),
        })
      )
      .catch(next);
  }
  //[GET]/ admin/pendingProducts
  pendingProducts(req, res, next) {
    let productQuery = Product.find({ isChecked: false });
    if (req.query.hasOwnProperty("_sort")) {
      productQuery = productQuery.sort({
        [req.query.column]: req.query.type,
      });
    }
    Promise.all([productQuery, Product.count({isChecked: false})])
      .then(([products, deletedCount]) =>
        res.render("admin/pendingProducts", {
          deletedCount,
          products: mitipleMongooseToObject(products),
        })
      )
      .catch(next);
  }

  //[GET]/ admin/deleted-pending-products
  deletedPendingProducts(req, res, next) {
    Product.findDeleted({ isChecked: false })
      .then((products) =>
        res.render("admin/deletedPendingProducts", {
          products: mitipleMongooseToObject(products),
        })
      )
      .catch(next);
  }
}

module.exports = new AdminController();
