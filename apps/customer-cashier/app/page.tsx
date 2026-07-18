import FAQsThree from "@canadian-cart/ui/landing/faqs-3";
import FeaturesSection from "@canadian-cart/ui/landing/features-8";
import FooterWrapper from "@canadian-cart/ui/landing/FooterWrapper";
import HeroSectionWrapper from "@canadian-cart/ui/landing/HeroSectionWrapper";
import NavbarWrapper from "@canadian-cart/ui/landing/NavbarWrapper";
import PacksSectionWrapper from "@canadian-cart/ui/landing/PackSectionWrapper";

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
