import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, SparklesIcon, FaceSmileIcon } from '@heroicons/react/24/outline';

// Service data - you can later move this to a separate file
const services = [
  {
    id: 1,
    title: "Bridal Makeup",
    description: "Professional bridal makeup with premium products",
    duration: "2-3 hours",
    price: "₹15,000",
    // icon: "💄"
    icon: <SparklesIcon className="w-12 h-12 text-pink-600" />
  },
  {
    id: 2,
    title: "Spa Therapy",
    description: "Full body massage with aromatherapy oils or any oil of your choice",
    duration: "1.5 hours",
    price: "₹3,500",
    // icon: "🌸"
    icon: <HeartIcon className="w-12 h-12 text-pink-600" />
  },
  {
    id: 3,
    title: "Hair Styling",
    description: "Professional hair styling for special occasions",
    duration: "1 hour",
    price: "₹2,500",
    // icon: "💇♀️"
    icon: <FaceSmileIcon className="w-12 h-12 text-pink-600" />
  },
];

export default function ServicesPreview() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-gray-800 mb-4"
          >
            Our Popular Services
          </motion.h2>
          <p className="text-gray-600">Experience luxury and transformation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="text-4xl mb-4 text-pink-600">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>⏱ {service.duration}</span>
                  <span className="text-lg font-bold text-pink-600">{service.price}</span>
                </div>

                <button className="mt-4 w-full bg-pink-50 text-pink-600 py-2 rounded-lg hover:bg-pink-100 transition">
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}