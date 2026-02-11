'use server'

import { revalidatePath } from "next/cache"
import { dbConnect } from "@/db/dbConnect"
import Product from "@/db/models/store/products.model"
import { ProductFormSchema, ProductFormValues } from "@/zod/validation/products/addProductsValidation"
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

interface ActionResponse{
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
}

export async function createProduct(data: ProductFormValues): Promise<ActionResponse> {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
        const CurrentstoreId = session?.user?.id;

        if(!CurrentstoreId){
            return{
                success: false,
                message: "Unauthorized"
            }
        }

    try{
        const validationResult = ProductFormSchema.safeParse(data);
        if(!validationResult.success){
            return{
                success: false,
                message: "validation failed",
                errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
            };
        }
        await dbConnect();

        const {price, disposableFee, tax, ...otherData} = validationResult.data;

        const dbPayload = {
            ...otherData,
            storeId: CurrentstoreId,
            tax: tax >  0 ? tax / 100 : 0, // converting percentage to decimal for storage
            price: Math.round(price * 100), // converting to cents
            disposableFee: Math.round((disposableFee || 0) * 100), // converting to cents}
        }

        await Product.create(dbPayload);

        revalidatePath("/store/products");
        return{
            success: true,
            message: "Product created successfully"
        }

    } catch(error){
        console.error("Error creating product:", error);
        return{
            success: false,
            message: "An error occurred while creating the product"
        }
    }
}