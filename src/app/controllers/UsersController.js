const User = require("../models/User");
const Product = require("../models/Product");
const {
  mitipleMongooseToObject,
  mongooseToObject,
} = require("../../util/mongoose");
class UsersController {
  //[GET] /User/:slug
  show(req, res, next) {
    User.findOne({ slug: req.params.slug })
      .then((user) => {
        res.render("users/show", {
          userC: mongooseToObject(user),
        });
      })
      .catch(next);
  }
  //[GET] /User/create
  create(req, res, next) {
    res.render("users/create");
  }
  //[POST] /User/store
  store(req, res, next) {
    const formdata = req.body;
    const user = new User(formdata);
    user
      .save()
      .then(() => res.redirect("/admin/stored/users"))
      .catch((error) => {});
  }
  //[POST] /User/:id/edit
  edit(req, res, next) {
    User.findById(req.params.id)
      .then((user) =>
        res.render("users/edit", {
          userC: mongooseToObject(user),
        })
      )
      .catch(next);
  }
  //[Put] /User/:id
  update(req, res, next) {
    if (!req.file) {
      User.findOne({ _id: req.params.id }).then((user) => {
        req.body.avatar = user.avatar;
      });
    } else {
      req.body.avatar = req.file.filename;
    }
    User.updateOne({ _id: req.params.id }, req.body)
      .then(() => res.redirect("back"))
      .catch(next);
  }
  //[Delete] /User/:id
  destroy(req, res, next) {
    User.delete({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }
  //[Delete] /User/:id/force
  forceDestroy(req, res, next) {
    Promise.all([
      User.deleteOne({ _id: req.params.id }),
      Product.deleteOne({ userId: req.params.id }),
    ])
      .then(() => res.redirect("back"))
      .catch(next);
  }
  //[Patch] /User/:id/restore
  restore(req, res, next) {
    User.restore({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }

  //[POST] /User/handleFormActions
  handleFormActions(req, res, next) {
    switch (req.body.action) {
      case "delete":
        Promise([
          User.deleteOne({ _id: req.params.id }),
          Product.delete({ userId: req.params.id }),
        ])
          .then(() => res.redirect("back"))
          .catch(next);
        break;
      case "forceDelete":
        User.deleteOne({ _id: { $in: req.body.usersIds } })
          .then(() => res.redirect("back"))
          .catch(next);
        break;
      case "restore":
        User.restore({ _id: { $in: req.body.usersIds } })
          .then(() => res.redirect("back"))
          .catch(next);
        break;
      default:
        res.json({ message: "Action is invalid" });
    }
  }
}

module.exports = new UsersController();
