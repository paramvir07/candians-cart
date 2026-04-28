import FAQsThree from "@/components/landing/faqs-3";
import FeaturesSection from "@/components/landing/features-8";
import Footer from "@/components/landing/Footer";
import HeroSectionWrapper from "@/components/landing/HeroSectionWrapper";
import NavbarWrapper from "@/components/landing/NavbarWrapper";

const page = async () => {
  return (
    <div>
      <NavbarWrapper />
      <HeroSectionWrapper />
      <FeaturesSection />
      <FAQsThree />
      <Footer />
    </div>
  );
};

export default page;
