import Contact from "@canadian-cart/ui/contact/Contact"
import Footer from "@canadian-cart/ui/landing/Footer"
import NavbarWrapper from "@canadian-cart/ui/landing/NavbarWrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
}
const page = () => {
  return (
    <>
    <NavbarWrapper />
    <Contact />
    <Footer />
    </>
  )
}

export default page