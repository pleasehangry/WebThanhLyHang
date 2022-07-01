const User = require("../models/User");
const Product = require("../models/Product");
const OrderDetail = require("../models/OrderDetail");
const Order = require("../models/Order");
const toast = require("../middlewares/ToastMesssage");
const {
  mitipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");
class MeController {
  //[GET] / me/stored/product
  storedProducts(req, res, next) {
    console.log(req.cookies.userId);
    let productQuery = Product.find({ userId: req.cookies.userId });
    if (req.query.hasOwnProperty("_sort")) {
      productQuery = productQuery.sort({
        [req.query.column]: req.query.type,
      });
    }
    Promise.all([
      productQuery,
      Product.countDocumentsDeleted({ userId: req.cookies.userId }),
    ])
      .then(([products, deletedCount]) =>
        res.render("me/storedProducts", {
          deletedCount,
          products: mitipleMongooseToObject(products),
        })
      )
      .catch(next);
  }

  //[GET] / me/trash/product
  trashProducts(req, res, next) {
    Product.findDeleted({ userId: req.cookies.userId })
      .then((products) =>
        res.render("me/trashProducts", {
          products: mitipleMongooseToObject(products),
        })
      )
      .catch(next);
  }

  //[post] / me/cart/product
  async addCartProduct(req, res, next) {
    await OrderDetail.findOne(
      { productId: req.body.productId, customerId: req.cookies.userId },
      function (err, orderDetail) {
        if (err) return res.send(err);
        if (orderDetail) {
          res.redirect("/me/cart/products");
          return;
        } else {
          req.body.customerId = req.cookies.userId;
          const formdata = req.body;
          const orderDetail = new OrderDetail(formdata);
          orderDetail
            .save()
            .then(() => res.redirect("/me/cart/products"))
            .catch((error) => {});
        }
      }
    );
  }
  //[post] / me/addOrder
  async addOrder(req, res, next) {
    var sellerId;
    await OrderDetail.findOne({ _id: req.body.orderDetailId })
      .then((orderDetail) => {
        Product.findOne({ _id: orderDetail.productId }).then((product) => {
          sellerId = product.userId;
          req.body.sellerId = sellerId;
          const formdata = req.body;
          const order = new Order(formdata);
          order
            .save()
            .then(() => res.redirect("back"))
            .catch((error) => {});
        });
      })
      .catch(next);
  }
  //[GET] / me/cart/product
  cartProducts(req, res, next) {
    Order.find({})
      .then((orders) => {
        const ex = orders.map((order) => order.orderDetailId);
        OrderDetail.find({ _id: { $nin: ex } })
          .then((orderDetails) => {
            const ODs = [];
            orderDetails.forEach((orderDetail) => {
              if (orderDetail.customerId === req.cookies.userId) {
                ODs.push(orderDetail);
              }
            });
            const arr = [];
            const b = [];
            const c = [];
            ODs.forEach((OD) => {
              arr.push(OD.productId);
              b.push(OD._id);
              c.push(OD.quantity);
            });
            const products = [];
            for (let i = 0; i < arr.length; i++) {
              Product.findById(arr[i], function (err, product) {
                if (err) return res.send("err");
                if (product) {
                  product = mongooseToObject(product);
                  Object.assign(product, {
                    orderDetailId: b[i],
                    ODQtt: c[i],
                  });
                  products.push(product);
                }
              });
            }
            res.render("me/cartProducts", { products });
          })
          .catch(next);
      })
      .catch(next);
  }

  //[DELeTE] / me/hideFromCart/:id/force
  hideFromCart(req, res, next) {
    OrderDetail.deleteOne({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }

  //[GET] / me/watingBoughtProducts/product
  watingBoughtProducts(req, res, next) {}
  //[GET] / me/CustomerOrders
  orders(req, res, next) {
    Order.find({ sellerId: req.cookies.userId })
      .then((orders) => {
        const a = [];
        orders.forEach((order) => a.push(order.orderDetailId));
        const b = [];
        const c = [];
        const d = [];
        const e = orders.map((order) => order.OrderQtt);
        OrderDetail.find({ _id: { $in: a } }, { deleted: false })
          .then((orderDetails) => {
            orderDetails.forEach((orderDetail) => {
              d.push(orderDetail.productId);
              b.push(orderDetail.customerId);
            });
            for (let i = 0; i < b.length; i++) {
              User.findById(b[i], function (err, user) {
                if (err) return res.send(err);
                else {
                  c.push(user.slug);
                }
              });
            }
            const products = [];
            for (let i = 0; i < d.length; i++) {
              Product.findById(d[i], function (err, product) {
                if (err) return res.send(err);
                else {
                  product = mongooseToObject(product);
                  Object.assign(product, {
                    customerSlug: c[i],
                    ODQtt: e[i],
                  });
                  products.push(product);
                }
              });
            }
            res.render("me/storedOrders", { products });
          })
          .catch(next);
      })
      .catch(next);
  }
  //[GET] /me/order-status
  async orderStatus(req, res, next) {
    Order.find({})
      .then( Orders => {
        const OrderStatus = [];
        Orders.forEach( O => {
          Order.findById(O._id)
            .then( OD => {
              return OrderDetail.findOne({_id: OD.orderDetailId})
                .then(ODe => {
                  OD = mongooseToObject(OD);
                  ODe = mongooseToObject(ODe);
                  return {
                    OD,
                    ODe
                  }
                })
            })
            .then(data => {
              return Product.findById(data.ODe.productId)
                .then(product => {
                  product = mongooseToObject(product);
                  return {
                    Order: data.OD,
                    OrderDetail: data.ODe,
                    Product: product
                  }
                })
            })
            .then(data => {
              if(data.OrderDetail.customerId == req.cookies.userId){
                OrderStatus.push(data);
              }
            })
        })
        console.log(OrderStatus);
        res.render('me/statusOrder', { OrderStatus })
      })
      .catch(next)
  }

  //[DELETE] /me/:id/deleteOrder
  async DeleteOrder(req, res, next){
    await Order.deleteOne({_id: req.params.id})
      .then(() => res.redirect("back"))
      .catch(next);
  }

  //[POST] /me/handleFormActions
  handleFormActions(req, res, next) {
    switch (req.body.action) {
      case "forceDelete":
        OrderDetail.deleteMany({ _id: { $in: req.body.productsIds } })
          .then(() => res.redirect("back"))
          .catch(next);
        break;
      case "buy":
        const arr = req.body.productsIds;
        for (let i = 0; i < arr.length; i++) {
          OrderDetail.findOne({ _id: arr[i] })
            .then((orderDetail) => {
              Product.findOne({ _id: orderDetail.productId }).then(
                (product) => {
                  var sellerId = product.userId;
                  var orderDetailId = orderDetail._id;
                  req.body.sellerId = sellerId;
                  req.body.orderDetailId = orderDetailId;
                  const formdata = req.body;
                  const order = new Order(formdata);
                  order
                    .save()
                    .then(() => res.redirect("back"))
                    .catch((error) => {});
                }
              );
            })
            .catch(next);
        }
        break;
      default:
        res.json({ message: "Action is invalid" });
    }
  }
}

module.exports = new MeController();
