import About from "@canadian-cart/ui/about/About"
import Footer from "@canadian-cart/ui/landing/Footer"
import NavbarWrapper from "@canadian-cart/ui/landing/NavbarWrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
}

const page = () => {
  return (
    <>
    <NavbarWrapper />
    <About />
    <Footer />
    </>
  )
}

export default page