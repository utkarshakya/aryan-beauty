import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import ServicesPreview from "./components/ServicesPreview";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ServicesPreview />
    </>
  );
}
