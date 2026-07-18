import FooterWrapper from "@canadian-cart/ui/landing/FooterWrapper"
import NavbarWrapper from "@canadian-cart/ui/landing/NavbarWrapper"
import Terms from "@canadian-cart/ui/termsAndPrivacyPolicy/Terms"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions",
}


const TermsAndConditions = () => {
  return (
    <>
    <NavbarWrapper />
    <Terms />
    <FooterWrapper />
    </>
  )
}

export default TermsAndConditions