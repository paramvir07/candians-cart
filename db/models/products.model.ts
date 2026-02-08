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
    price: {
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

        // Check  for at least one image

    }
}, {timestamps: true});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);