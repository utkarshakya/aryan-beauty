import React from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="bg-pink-50 py-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-gray-800 mb-6"
        >
          Discover Your Natural Beauty
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl text-gray-600 mb-8"
        >
          Professional beauty services tailored just for you
        </motion.p>
        <button className="bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 transition">
          Book Appointment
        </button>
      </div>
    </section>
  );
}
