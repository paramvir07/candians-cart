import CareersPage from '@/components/careers/Career'
import FooterWrapper from '@/components/landing/FooterWrapper'
import NavbarWrapper from '@/components/landing/NavbarWrapper'
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