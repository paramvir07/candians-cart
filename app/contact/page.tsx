import Contact from "@/components/contact/Contact"
import Footer from "@/components/landing/Footer"
import NavbarWrapper from "@/components/landing/NavbarWrapper"
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