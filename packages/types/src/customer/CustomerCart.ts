export interface IProductImage {
  url?: string
  fileId: string
  _id: string
}

export interface IProduct {
  _id: string
  storeId: string
  name: string
  description: string
  category: string
  markup: number
  disposableFee?: number
  tax: number
  price: number
  stock: boolean
  subsidised: boolean,
  images?: IProductImage[]
  PriceDrop?:boolean
  createdAt: string
  updatedAt: string
  isMeasuredInWeight?: boolean;
UOM?: string;
}

export interface ICartItem {
  productId: IProduct
  storeId: string
  quantity: number
  createdAt: string
  updatedAt: string
}