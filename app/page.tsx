import FAQsThree from "@/components/landing/faqs-3";
import FeaturesSection from "@/components/landing/features-8";
import FooterWrapper from "@/components/landing/FooterWrapper";
import HeroSectionWrapper from "@/components/landing/HeroSectionWrapper";
import NavbarWrapper from "@/components/landing/NavbarWrapper";
import PacksSectionWrapper from "@/components/landing/PackSectionWrapper";

const page = async () => {
  return (
    <div>
      <NavbarWrapper />
      <HeroSectionWrapper />
      <FeaturesSection />
      <PacksSectionWrapper />
      <FAQsThree />
      <FooterWrapper />
    </div>
  );
};

export default page;
