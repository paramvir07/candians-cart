"use client"
import FAQsThree from "@/components/landing/faqs-3"
import FeaturesSection from "@/components/landing/features-8"
import Footer from "@/components/landing/Footer"
import HeroSection from "@/components/landing/hero-section"
import Navbar from "@/components/landing/Navbar"

const page = async() => {
  return (
    <div>
      <Navbar />
        <HeroSection/>
        <FeaturesSection/>
        <FAQsThree/>
        <Footer />
    </div>
  )
}

export default page