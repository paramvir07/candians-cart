"use server"

import { dbConnect } from "@/db/dbConnect"
import productsModel from "@/db/models/store/products.model";

interface ProductResult {
  success: boolean;
  data: {
    _id: string;
    storeId: string;
    name: string;
    description?: string;
    category: string;
    markup: number;
    tax: number;
    disposableFee?: number;
    price: number;
    stock: boolean;
    subsidised: boolean;
    images: { url: string; fileId: string }[];
    isFeatured: boolean;
    InvoiceId?: string;
    primaryUPC?: string;
    isMeasuredInWeight?: boolean;
    UOM?: string;
    vendorId?: string;
    createdAt: Date;
    updatedAt: Date;
    PriceDrop?: Boolean;
  } | null;
}
interface createPriceDropPayload{
  productId: string;
  newBasePriceCents: number;
  priceDrop: boolean
}

export const getProductById = async (productId: string): Promise<ProductResult> => {
  try {
    await dbConnect();
    const data = await productsModel.findById(productId).lean();
    if (!data) {
      return { success: true, data: null };
    }
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (err) {
    console.log(err);
    return { success: false, data: null };
  }
};

export const createPriceDropItem = async (Payload:createPriceDropPayload) =>{
  if(!Payload){
    return {success:false,message:"Payload data is required"}
  }
  try{
    await dbConnect();
    const ProductData = await getProductById(Payload.productId);
    if(!ProductData.data){
      return {success:false,message:"No Product Found"}
    }
    const product = ProductData.data;

    if(product?.PriceDrop){
      return {sucess:false,message:"Product already marked as price dropped"}
    }
    if(Payload.newBasePriceCents === product.price){
      return {success:false,message:"No price drop detected"}
    }
    if(Payload.newBasePriceCents>product.price){
      return {success:false,message:"Price cannot be increased"}
    }

    let newUPC = "PD-"+product.primaryUPC;
    if(!product.primaryUPC){
      newUPC = "PD-"+product.name
    }
    
    const PDProduct = await productsModel.create({
      storeId: product.storeId,
      name: product.name+" (Price Drop)",
      description: product.description,
      category: product.category,
      markup: product.markup,
      tax: product.tax,
      disposableFee: product.disposableFee,
      price: Payload.newBasePriceCents,
      stock: product.stock,
      images: product.images,
      subsidised: product.subsidised,
      isFeatured: product.isFeatured,
      InvoiceId: product.InvoiceId,
      isMeasuredInWeight: product.isMeasuredInWeight,
      UOM: product.UOM,
      primaryUPC: newUPC,
      PriceDrop: true,
    });
    
    if(!PDProduct) return {success:false,message:"Error creating Price Drop"}
    return {success:true, message:`Price drop created with UPC : ${newUPC}`}
  
  }catch(error){
    console.log(error)
    return {success:false,message:"Error creating price drop product"}
  }
}