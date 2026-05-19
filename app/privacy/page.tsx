import FooterWrapper from "@/components/landing/FooterWrapper"
import NavbarWrapper from "@/components/landing/NavbarWrapper"
import Privacy from "@/components/termsAndPrivacyPolicy/Privacy"
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