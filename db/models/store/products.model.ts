import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({

/*
shopId
id
name . 
description . 
price . 
images .
inStock -: [true, false] .

*/ 

    shopId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
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

    Price: {
        type: Number,  // in cents
        required: true,
    },

    inStock:{
        type: Boolean,
        default: true
    },

    images:{
        type: [{
            url: {type: String, required: true},
            fileId: {type: String, required: true}
        }],

    }
}, {timestamps: true});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);