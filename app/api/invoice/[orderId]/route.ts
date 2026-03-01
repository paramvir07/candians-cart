import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { NextResponse } from "next/server"
import { dbConnect } from "@/db/dbConnect"
import OrderModel from "@/db/models/customer/Orders.Model"

const GREEN_PRIMARY = rgb(0.38, 0.67, 0.35)
const GREEN_LIGHT   = rgb(0.91, 0.97, 0.91)
const GREEN_DARK    = rgb(0.18, 0.35, 0.22)
const GRAY_LINE     = rgb(0.88, 0.93, 0.88)
const MUTED         = rgb(0.52, 0.60, 0.54)
const WHITE         = rgb(1, 1, 1)

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  await dbConnect()

  const { orderId } = await params

  const order = await OrderModel.findById(orderId)
    .populate("products.productId")
    .lean()

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const pdfDoc = await PDFDocument.create()
  const page   = pdfDoc.addPage([595, 842])
  const font     = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()

  const margin = 48
  const contentWidth = width - margin * 2

  page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: GREEN_PRIMARY })

  page.drawText("CanadianCart", { x: margin, y: height - 44, font: boldFont, size: 22, color: WHITE })

  const invoiceLabel = "INVOICE"
  const invoiceLabelW = boldFont.widthOfTextAtSize(invoiceLabel, 26)
  page.drawText(invoiceLabel, { x: width - margin - invoiceLabelW, y: height - 48, font: boldFont, size: 26, color: WHITE })

  page.drawText("Your trusted Canadian marketplace", { x: margin, y: height - 62, font, size: 9, color: rgb(0.8, 0.95, 0.8) })

  let y = height - 130

  const drawLabel = (label: string, value: string, yPos: number) => {
    page.drawText(label, { x: margin, y: yPos, font, size: 9, color: MUTED })
    page.drawText(value, { x: margin, y: yPos - 14, font: boldFont, size: 11, color: GREEN_DARK })
  }

  const drawLabelRight = (label: string, value: string, yPos: number) => {
    const valW = boldFont.widthOfTextAtSize(value, 11)
    const lblW = font.widthOfTextAtSize(label, 9)
    page.drawText(label, { x: width - margin - lblW, y: yPos, font, size: 9, color: MUTED })
    page.drawText(value, { x: width - margin - valW, y: yPos - 14, font: boldFont, size: 11, color: GREEN_DARK })
  }

  drawLabel("ORDER ID", `#${order._id.toString().slice(-8).toUpperCase()}`, y)
  drawLabelRight("DATE", new Date((order as any).createdAt).toLocaleDateString("en-CA", {
    year: "numeric", month: "long", day: "numeric"
  }), y)

  y -= 44
  drawLabel("FULL ORDER ID", order._id.toString(), y)
  drawLabelRight("STATUS", "Paid", y)

  y -= 32
  page.drawRectangle({ x: margin, y, width: contentWidth, height: 1, color: GRAY_LINE })
  y -= 20

  page.drawRectangle({ x: margin, y: y - 4, width: contentWidth, height: 22, color: GREEN_LIGHT })

  const col = {
    item:  margin + 8,
    qty:   margin + contentWidth * 0.54,
    price: margin + contentWidth * 0.68,
    total: margin + contentWidth * 0.84,
  }

  page.drawText("ITEM",       { x: col.item,  y: y + 4, font: boldFont, size: 8, color: GREEN_PRIMARY })
  page.drawText("QTY",        { x: col.qty,   y: y + 4, font: boldFont, size: 8, color: GREEN_PRIMARY })
  page.drawText("UNIT PRICE", { x: col.price, y: y + 4, font: boldFont, size: 8, color: GREEN_PRIMARY })
  page.drawText("TOTAL",      { x: col.total, y: y + 4, font: boldFont, size: 8, color: GREEN_PRIMARY })

  y -= 20

  let rowIndex = 0
  for (const item of order.products as any[]) {
    const name      = item.productId?.name || "Unknown Product"
    const qty       = item.quantity.toString()
    const unitPrice = `CA$${((item.productId?.price ?? 0) / 100).toFixed(2)}`
    const lineTotal = `CA$${((item.total ?? 0) / 100).toFixed(2)}`

    if (rowIndex % 2 === 0) {
      page.drawRectangle({ x: margin, y: y - 6, width: contentWidth, height: 22, color: rgb(0.98, 1, 0.98) })
    }

    const maxNameW = contentWidth * 0.50
    let displayName = name
    while (displayName.length > 4 && font.widthOfTextAtSize(displayName, 10) > maxNameW) {
      displayName = displayName.slice(0, -1)
    }
    if (displayName !== name) displayName += "…"

    page.drawText(displayName, { x: col.item,  y, font,           size: 10, color: GREEN_DARK })
    page.drawText(qty,         { x: col.qty,   y, font,           size: 10, color: GREEN_DARK })
    page.drawText(unitPrice,   { x: col.price, y, font,           size: 10, color: GREEN_DARK })
    page.drawText(lineTotal,   { x: col.total, y, font: boldFont, size: 10, color: GREEN_DARK })

    y -= 24
    rowIndex++
  }

  y -= 8
  page.drawRectangle({ x: margin, y, width: contentWidth, height: 1, color: GRAY_LINE })
  y -= 24

  const totalLabelX = width - margin - 180
  const totalValueX = width - margin - 80

  page.drawText("Subtotal", { x: totalLabelX, y, font, size: 10, color: MUTED })
  const subtotalStr = `CA$${(order.cartTotal / 100).toFixed(2)}`
  page.drawText(subtotalStr, { x: totalValueX, y, font, size: 10, color: GREEN_DARK })
  y -= 18

  page.drawText("Shipping", { x: totalLabelX, y, font, size: 10, color: MUTED })
  page.drawText("Free",     { x: totalValueX, y, font, size: 10, color: GREEN_PRIMARY })
  y -= 18

  page.drawRectangle({ x: totalLabelX - 8, y, width: 180 + 8 + margin - 16, height: 1, color: GRAY_LINE })
  y -= 20

  page.drawRectangle({
    x: totalLabelX - 12, y: y - 8,
    width: width - margin - totalLabelX + 12,
    height: 30,
    color: GREEN_PRIMARY,
  })
  page.drawText("TOTAL", { x: totalLabelX, y: y + 2, font: boldFont, size: 11, color: WHITE })
  const totalStr = `CA$${(order.cartTotal / 100).toFixed(2)}`
  const totalStrW = boldFont.widthOfTextAtSize(totalStr, 13)
  page.drawText(totalStr, { x: width - margin - totalStrW, y: y + 2, font: boldFont, size: 13, color: WHITE })

  const footerY = 52
  page.drawRectangle({ x: 0, y: 0, width, height: footerY, color: GREEN_LIGHT })
  page.drawRectangle({ x: 0, y: footerY, width, height: 1, color: GRAY_LINE })

  page.drawText("Thank you for shopping with CanadianCart!", { x: margin, y: footerY - 18, font, size: 9, color: MUTED })

  const supportText = "support@canadiancart.ca"
  const supportW = font.widthOfTextAtSize(supportText, 9)
  page.drawText(supportText, { x: width - margin - supportW, y: footerY - 18, font, size: 9, color: GREEN_PRIMARY })

  page.drawText(`Invoice generated on ${new Date().toLocaleDateString("en-CA")}`, {
    x: margin, y: footerY - 32, font, size: 8, color: rgb(0.72, 0.78, 0.72),
  })

  const pdfBytes = await pdfDoc.save()
  const buffer = Buffer.from(pdfBytes)

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${order._id}.pdf`,
    },
  })
}