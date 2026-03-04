"use client"
import { QRCodeSVG } from "qrcode.react";
type QrCodeClientProps = {
  id: string
}
const QrCodeClient = ({id}: QrCodeClientProps) => {
  return (
      <QRCodeSVG value={id} size={220} />
  
  );
}

export default QrCodeClient