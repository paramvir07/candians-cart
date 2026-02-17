import mongoose, {Schema} from "mongoose";

const ProductSchema = new mongoose.Schema({

/*

_id in shop info
shopId -: refer to the storeInfo model, this is the store
id
name . 
description . 
category -: enum of categories, for example fruits, vegetables, dairy, meat, bakery, beverages, snacks, household, personal care, other
markup -: percentage markup for the product for 30 % 
tax -: percentage tax for the product, for example no tax, GST 5%, PST 7%, GST+PST 12%
disposableFee -: in cents, for example milk carten disposdable fee, for example 10 cents
price . in cents
stock .
images required false as of now.

*/ 

    storeId:{  //Refer to the _id storeInfo model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'storeInfo',
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    
    category:{
        type: String,
        enum: ["Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages", "Snacks", "Household", "Personal Care", "Other"],
        required: true,
    },

    markup:{
        type: Number,  // percentage markup for the product for 30 %
        required: true,
    },

    tax:{
        type: Number,  // percentage tax for the product
        enum: [0.00, 0.05, 0.07, 0.12], // no tax, GST 5%, PST 7%, GST+PST 12%
        required: true,
    },

    disposableFee: {
        type: Number,  // in cents
        required: false, // milk carten disposdable fee, for example 10 cents
    },

    price: {
        type: Number,  // in cents
        required: true,
    },

    stock:{
        type: Number,
        default: 0,
        required: true,
    },

    images:{
        type: [{
            url: {type: String, required: true},
            fileId: {type: String, required: true}
        }],
        required: false,  // For the time being this is false, have to integrate Imagekit
    }
}, {timestamps: true});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);