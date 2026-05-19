import FooterWrapper from "@/components/landing/FooterWrapper"
import NavbarWrapper from "@/components/landing/NavbarWrapper"
import Terms from "@/components/termsAndPrivacyPolicy/Terms"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
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