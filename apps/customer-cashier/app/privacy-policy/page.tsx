import FooterWrapper from "@canadian-cart/ui/landing/FooterWrapper"
import NavbarWrapper from "@canadian-cart/ui/landing/NavbarWrapper"
import Privacy from "@canadian-cart/ui/termsAndPrivacyPolicy/Privacy"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
}


const PrivacyPolicy = () => {
  return (
    <>
    <NavbarWrapper />
    <Privacy />
    <FooterWrapper />
    </>
  )
}

export default PrivacyPolicy