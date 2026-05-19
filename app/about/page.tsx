import About from "@/components/about/About"
import Footer from "@/components/landing/Footer"
import NavbarWrapper from "@/components/landing/NavbarWrapper"
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