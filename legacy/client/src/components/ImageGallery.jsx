import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const galleryImages = [
  {
    id: 1,
    src: "https://cdn.pixabay.com/photo/2018/03/12/12/32/woman-3219507_640.jpg",
    category: "Bridal",
    caption: "Full Bridal Makeover",
  },
  {
    id: 2,
    src: "https://cdn.pixabay.com/photo/2017/09/01/21/53/sunglasses-2705642_640.jpg",
    category: "Hair",
    caption: "Hair Coloring",
  },
  {
    id: 3,
    src: "https://cdn.pixabay.com/photo/2023/09/26/17/32/woman-8277925_640.jpg",
    category: "Spa",
    caption: "Facial Treatment",
  },
  {
    id: 4,
    src: "https://cdn.pixabay.com/photo/2017/09/01/21/53/sunglasses-2705642_640.jpg",
    category: "Hair",
    caption: "Hair Coloring",
  },
  {
    id: 5,
    src: "https://cdn.pixabay.com/photo/2017/09/01/21/53/sunglasses-2705642_640.jpg",
    category: "Hair",
    caption: "Hair Coloring",
  },
  // Add more images
];

export default function ImageGallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section className="py-16 bg-pink-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-4">
            Our Transformations
          </h2>
          <p className="text-gray-600">Witness the magic we create</p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.caption}
                className="w-full h-auto rounded-lg shadow-lg transition-transform group-hover:scale-95"
              />

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
                <MagnifyingGlassIcon className="w-12 h-12 text-white opacity-75" />
                <div className="absolute bottom-4 left-4 text-white text-left">
                  <p className="font-semibold">{image.category}</p>
                  <p className="text-sm">{image.caption}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl w-full relative">
              <img
                src={selectedImage.src}
                alt={selectedImage.caption}
                className="rounded-lg shadow-xl"
              />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-2xl font-playfair">
                  {selectedImage.caption}
                </p>
                <p className="text-pink-200">
                  {selectedImage.category} Service
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
