import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  FaceSmileIcon,
  PaintBrushIcon,
  HeartIcon,
  HandRaisedIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";

const Services = () => {
  const [services, setServices] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock async function to fetch services
  const fetchServices = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          Hair: [
            {
              id: 1,
              name: "Hair Wash & Blow Dry",
              description:
                "Professional hair washing with premium products and styling blow dry",
              price: "$35",
              duration: "45 min",
              image:
                "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop",
            },
            {
              id: 2,
              name: "Hair Cutting & Styling",
              description:
                "Expert hair cutting with modern styling techniques for all hair types",
              price: "$65",
              duration: "60 min",
              image:
                "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=300&fit=crop",
            },
            {
              id: 3,
              name: "Hair Coloring",
              description:
                "Professional hair coloring with high-quality products and color matching",
              price: "$120",
              duration: "2 hours",
              image:
                "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=300&fit=crop",
            },
            {
              id: 4,
              name: "Hair Treatment",
              description:
                "Deep conditioning and nourishing hair treatment for healthy, shiny hair",
              price: "$85",
              duration: "90 min",
              image:
                "https://images.unsplash.com/photo-1555688829-4760d20cd35c?w=400&h=300&fit=crop",
            },
          ],
          Skin: [
            {
              id: 5,
              name: "Classic Facial",
              description:
                "Deep cleansing facial with exfoliation and moisturizing treatment",
              price: "$75",
              duration: "60 min",
              image:
                "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
            },
            {
              id: 6,
              name: "Anti-Aging Facial",
              description:
                "Advanced anti-aging treatment with collagen boost and firming massage",
              price: "$120",
              duration: "75 min",
              image:
                "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop",
            },
            {
              id: 7,
              name: "Acne Treatment",
              description:
                "Specialized treatment for acne-prone skin with deep pore cleansing",
              price: "$95",
              duration: "60 min",
              image:
                "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
            },
            {
              id: 8,
              name: "Hydrating Facial",
              description:
                "Intensive hydration treatment for dry and sensitive skin types",
              price: "$85",
              duration: "60 min",
              image:
                "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400&h=300&fit=crop",
            },
          ],
          Makeup: [
            {
              id: 9,
              name: "Party Makeup",
              description:
                "Glamorous makeup look perfect for parties and special occasions",
              price: "$65",
              duration: "45 min",
              image:
                "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop",
            },
            {
              id: 10,
              name: "Bridal Makeup",
              description:
                "Complete bridal makeup package with trial session and touch-ups",
              price: "$200",
              duration: "2 hours",
              image:
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
            },
            {
              id: 11,
              name: "Natural Day Look",
              description:
                "Subtle and natural makeup perfect for everyday wear",
              price: "$45",
              duration: "30 min",
              image:
                "https://images.unsplash.com/photo-1498462440456-0dba182e775b?w=400&h=300&fit=crop",
            },
            {
              id: 12,
              name: "Evening Glam",
              description:
                "Bold and sophisticated makeup for evening events and dinners",
              price: "$85",
              duration: "60 min",
              image:
                "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=400&h=300&fit=crop",
            },
          ],
          Spa: [
            {
              id: 13,
              name: "Swedish Massage",
              description:
                "Relaxing full-body massage using Swedish massage techniques",
              price: "$110",
              duration: "60 min",
              image:
                "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
            },
            {
              id: 14,
              name: "Hot Stone Therapy",
              description:
                "Therapeutic massage with heated stones for deep muscle relaxation",
              price: "$135",
              duration: "75 min",
              image:
                "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=300&fit=crop",
            },
            {
              id: 15,
              name: "Aromatherapy Session",
              description:
                "Relaxing aromatherapy treatment with essential oils and massage",
              price: "$95",
              duration: "60 min",
              image:
                "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop",
            },
            {
              id: 16,
              name: "Body Scrub & Wrap",
              description:
                "Exfoliating body scrub followed by nourishing body wrap treatment",
              price: "$125",
              duration: "90 min",
              image:
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            },
          ],
          Nails: [
            {
              id: 17,
              name: "Classic Manicure",
              description:
                "Professional nail care with shaping, cuticle work, and polish",
              price: "$35",
              duration: "45 min",
              image:
                "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
            },
            {
              id: 18,
              name: "Gel Polish Manicure",
              description: "Long-lasting gel polish application with UV curing",
              price: "$55",
              duration: "60 min",
              image:
                "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400&h=300&fit=crop",
            },
            {
              id: 19,
              name: "Pedicure Deluxe",
              description:
                "Luxury pedicure with foot soak, exfoliation, and massage",
              price: "$65",
              duration: "75 min",
              image:
                "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=300&fit=crop",
            },
            {
              id: 20,
              name: "Nail Art Design",
              description:
                "Creative nail art with custom designs and decorative elements",
              price: "$45",
              duration: "60 min",
              image:
                "https://images.unsplash.com/photo-1588827930930-2e9d8cfa3f2a?w=400&h=300&fit=crop",
            },
          ],
        });
      }, 1000);
    });
  };

  useEffect(() => {
    const loadServices = async () => {
      const data = await fetchServices();
      setServices(data);
      setFilteredServices(getAllServices(data));
      setLoading(false);
    };
    loadServices();
  }, []);

  const getAllServices = (servicesData) => {
    const allServices = [];
    Object.keys(servicesData).forEach((category) => {
      servicesData[category].forEach((service) => {
        allServices.push({ ...service, category });
      });
    });
    return allServices;
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredServices(getAllServices(services));
    } else {
      setFilteredServices(
        services[category]?.map((service) => ({ ...service, category })) || []
      );
    }
  };

  const handleBookNow = (service) => {
    console.log("Booking service:", service);
    // Add booking logic here
  };

  const categories = [
    { name: "All", icon: SparklesIcon },
    { name: "Hair", icon: SparklesIcon },
    { name: "Skin", icon: FaceSmileIcon },
    { name: "Makeup", icon: PaintBrushIcon },
    { name: "Spa", icon: HeartIcon },
    { name: "Nails", icon: HandRaisedIcon },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading our beautiful services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar></Navbar>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600">
                Services
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our comprehensive range of beauty services designed to
              make you look and feel your absolute best
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.name}
                  onClick={() => handleCategoryChange(category.name)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center px-5 py-2.5 rounded-full font-semibold transition-all duration-300 text-sm min-w-fit ${
                    activeCategory === category.name
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200"
                      : "bg-white/80 text-gray-700 hover:bg-pink-50 hover:text-pink-600 hover:shadow-md border border-pink-100"
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  {category.name}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Services Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 20px 40px rgba(236, 72, 153, 0.15)",
                  }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-pink-100 hover:border-pink-300 transition-all duration-300 max-w-sm mx-auto w-full"
                >
                  {/* Service Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                        <StarIcon className="w-4 h-4 text-pink-500 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Price and Duration */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-pink-600 font-semibold">
                        <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                        <span className="text-base">{service.price}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{service.duration}</span>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <motion.button
                      onClick={() => handleBookNow(service)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-2.5 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                    >
                      Book Now
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* No Services Message */}
          {filteredServices.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 text-lg">
                No services found in this category.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Services;
