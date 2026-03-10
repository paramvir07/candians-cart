"use server"

import {dbConnect} from "@/db/dbConnect"
import OrderModel from "@/db/models/customer/Orders.Model"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export async function getOverviewStats() {
  await dbConnect()
  const stats = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$cartTotal" },
        totalOrders: { $sum: 1 },
      }
    }
  ])
  
  if (!stats.length) return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }
  
  return {
    totalRevenue: stats[0].totalRevenue,
    totalOrders: stats[0].totalOrders,
    avgOrderValue: stats[0].totalRevenue / stats[0].totalOrders
  }
}

export async function getPieChartData() {
  await dbConnect()
  const data = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: "$storeId",
        orders: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "stores",
        localField: "_id",
        foreignField: "_id",
        as: "store"
      }
    },
    { $unwind: "$store" },
    {
      $project: {
        store: "$store.name",
        orders: 1,
        _id: 0
      }
    },
    { $sort: { orders: -1 } },
    { $limit: 5 }
  ])
  return data.map(d => ({ store: d.store, orders: d.orders }))
}

export async function getAreaChartData() {
  await dbConnect()
  const data = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, storeId: "$storeId" },
        revenue: { $sum: "$cartTotal" }
      }
    },
    {
      $lookup: { from: "stores", localField: "_id.storeId", foreignField: "_id", as: "store" }
    },
    { $unwind: "$store" },
    {
      $group: {
        _id: "$_id.month",
        stores: {
          $push: { k: "$store.name", v: { $divide: ["$revenue", 100] } } 
        }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 6 }
  ])

  const formattedData = data.map(d => {
    const obj: Record<string, any> = { month: MONTHS[(d._id - 1) % 12] || `M${d._id}` }
    d.stores.forEach((s: any) => { obj[s.k] = s.v })
    return obj
  })

  const keys = Array.from(new Set(data.flatMap(d => d.stores.map((s: any) => s.k)))) as string[]
  return { data: formattedData, keys }
}

export async function getTopProductsData() {
  await dbConnect()
  const topProducts = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$products" },
    {
      $group: { _id: "$products.productId", totalSold: { $sum: "$products.quantity" } }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" }
    },
    { $unwind: "$product" },
    { $project: { name: "$product.name", _id: 1 } }
  ])

  if (!topProducts.length) return { data: [], keys: [] }

  const topProductIds = topProducts.map(p => p._id)
  const productNames = topProducts.reduce((acc, p) => ({ ...acc, [p._id.toString()]: p.name }), {} as Record<string, string>)

  const data = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$products" },
    { $match: { "products.productId": { $in: topProductIds } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, productId: "$products.productId" },
        sold: { $sum: "$products.quantity" }
      }
    },
    {
      $group: {
        _id: "$_id.month",
        products: { $push: { k: { $toString: "$_id.productId" }, v: "$sold" } }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 6 }
  ])

  const formattedData = data.map(d => {
    const obj: Record<string, any> = { month: MONTHS[(d._id - 1) % 12] || `M${d._id}` }
    d.products.forEach((p: any) => {
      const name = productNames[p.k]
      if (name) obj[name] = p.v
    })
    return obj
  })

  return { data: formattedData, keys: Object.values(productNames) }
}

export async function getTopSpendersData() {
  await dbConnect()
  const topUsers = await OrderModel.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$userId", totalSpent: { $sum: "$cartTotal" } } },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: { from: "customers", localField: "_id", foreignField: "userId", as: "customer" }
    },
    { $unwind: "$customer" },
    { $project: { name: "$customer.name", _id: 1 } }
  ])

  if (!topUsers.length) return { data: [], keys: [] }

  const topUserIds = topUsers.map(u => u._id)
  const userNames = topUsers.reduce((acc, u) => ({ ...acc, [u._id.toString()]: u.name }), {} as Record<string, string>)

  const data = await OrderModel.aggregate([
    { $match: { status: "completed", userId: { $in: topUserIds } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, userId: "$userId" },
        spent: { $sum: "$cartTotal" }
      }
    },
    {
      $group: {
        _id: "$_id.month",
        users: { $push: { k: { $toString: "$_id.userId" }, v: { $divide: ["$spent", 100] } } }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 6 }
  ])

  const formattedData = data.map(d => {
    const obj: Record<string, any> = { month: MONTHS[(d._id - 1) % 12] || `M${d._id}` }
    d.users.forEach((u: any) => {
      const name = userNames[u.k]
      if (name) obj[name] = u.v
    })
    return obj
  })

  return { data: formattedData, keys: Object.values(userNames) }
}