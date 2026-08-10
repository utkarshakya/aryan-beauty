import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ServicesPreview from '../components/ServicesPreview';
import ImageGallery from '../components/ImageGallery';

export default function Home() {
  return (
    <>
      <Navbar></Navbar>
      <Hero></Hero>
      <ServicesPreview></ServicesPreview>
      {/* <ImageGallery></ImageGallery> */}
      {/* <Footer /> */}
    </>
  );
}