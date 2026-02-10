import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({

})

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);


/*  

shopID

userID

orderID will be created

location of store

Promotions if any

total amount in cents

tax if any

payment type -:
    card, cash

items/products -:
productIds
name
quantity
price per item (At that time)


Status -: 
    pending (User is picking up stuff), 
    completed, (Order is completed and picked up)
    cancled, (User didnt wanted to buy)
    refund requested, (User came for refund) 
    refunded,  (Order is refunded),
    refund rejected, (Refund is rejected by the store)
    failed, (Something went wrong with the order, like payment failed or something else)

locked

timestamps
date of order


*/