"use client"
import { QRCodeSVG } from "qrcode.react";
type QrCodeClientProps = {
  customerId: string
}
const QrCodeClient = ({customerId}: QrCodeClientProps) => {
  return (
      <QRCodeSVG value={customerId} size={220} />
  
  );
}

export default QrCodeClient