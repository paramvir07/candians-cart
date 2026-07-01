"use server"

import { inngestClient } from "@/lib/inngest/inngest"

export const triggerImageGeneration = async(productId:string, srcImageUrl:string,storeId:string) =>{
    
    await inngestClient.send({
        name: "product/image-generate",
        data:{
            productId,
            srcImageUrl,
            storeId
        }
    })
    return {success:true, message:"Image Generation Triggered"}
}