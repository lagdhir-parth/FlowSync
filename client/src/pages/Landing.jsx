import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import ProductPreview from "../components/landing/ProductPreview";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#07090F] text-[#E5E7EB] overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <ProductPreview />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
