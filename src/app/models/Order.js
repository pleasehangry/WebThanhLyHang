
const mongoose = require('mongoose')
const Schema = mongoose.Schema
var mongooseDelete = require('mongoose-delete');    

const Order = new Schema({
    sellerId: { type: String, required: true},
    orderDetailId: {type: String, require: true},
    OrderQtt: {type: Number, required: true},
},{
    timestamps: true,
})

Order.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
})  
module.exports = mongoose.model('Order', Order)