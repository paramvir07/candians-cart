import CareersPage from "@canadian-cart/ui/careers/Career"
import FooterWrapper from "@canadian-cart/ui/landing/FooterWrapper"
import NavbarWrapper from "@canadian-cart/ui/landing/NavbarWrapper"
import React from 'react'
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers",
}
const page = () => {
  return (
    <>
    <NavbarWrapper />
    <CareersPage />
    <FooterWrapper />
    </>
  )
}

export default page