import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  ScissorsIcon,
  SparklesIcon,
  HeartIcon,
  HandRaisedIcon
} from "@heroicons/react/24/outline";

// Service categories for dropdown
const serviceCategories = [
  { name: "Hair", icon: ScissorsIcon, href: "/services/hair" },
  { name: "Skin", icon: SparklesIcon, href: "/services/skin" },
  { name: "Spa", icon: HeartIcon, href: "/services/spa" },
  { name: "Nails", icon: HandRaisedIcon, href: "/services/nails" },
];

// Navigation items
const navigationItems = [
  { name: "Services", href: "/services", hasDropdown: true },
  { name: "About", href: "/about", hasDropdown: false },
  { name: "Contact", href: "/contact", hasDropdown: false },
  { name: "Login", href: "/login", hasDropdown: false },
];

// Mobile menu animation variants
const mobileMenuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const mobileItemVariants = {
  closed: { opacity: 0, x: -20 },
  open: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

// Desktop dropdown component
function DesktopDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-pink-100 overflow-hidden z-50"
      style={{
        animation: isOpen ? "slideDown 0.3s ease-out" : "slideUp 0.3s ease-out"
      }}
    >
      <div className="p-2">
        {serviceCategories.map((category, index) => (
          <Link
            key={category.name}
            to={category.href}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50/80 rounded-xl transition-all duration-200 group"
            onClick={onClose}
          >
            <category.icon className="h-5 w-5 text-pink-400 group-hover:text-pink-600 transition-colors duration-200" />
            <span className="font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Mobile dropdown component
function MobileDropdown({ isOpen }) {
  const variants = {
    closed: { opacity: 0, height: 0 },
    open: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <div 
      className="overflow-hidden"
      style={{
        height: isOpen ? "auto" : "0",
        opacity: isOpen ? 1 : 0,
        transition: "all 0.3s ease-in-out"
      }}
    >
      <div className="pl-4 border-l-2 border-pink-200 ml-4">
        {serviceCategories.map((category, index) => (
          <Link
            key={category.name}
            to={category.href}
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50/80 rounded-lg transition-all duration-200 my-1"
          >
            <category.icon className="h-4 w-4 text-pink-400" />
            <span className="text-sm">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileServicesOpen(false);
  };

  const toggleMobileServices = () => {
    setIsMobileServicesOpen(!isMobileServicesOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileServicesOpen(false);
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
      
      <nav className="sticky top-0 z-40 bg-gradient-to-r from-pink-50/95 via-cream-50/95 to-lavender-50/95 backdrop-blur-md shadow-lg border-b border-pink-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="group flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 rounded-lg px-2 py-1"
              aria-label="ABP Beauty Parlor Home"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent group-hover:from-pink-700 group-hover:via-rose-600 group-hover:to-pink-800 transition-all duration-300">
                ABP
              </div>
              <div className="h-8 w-0.5 bg-gradient-to-b from-pink-300 to-pink-500 group-hover:from-pink-400 group-hover:to-pink-600 transition-all duration-300"></div>
              <div className="text-sm font-light text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                Beauty Parlor
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.hasDropdown ? (
                    <button
                      className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50/80 rounded-full transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                      onMouseEnter={() => setIsServicesDropdownOpen(true)}
                      onMouseLeave={() => setIsServicesDropdownOpen(false)}
                      aria-expanded={isServicesDropdownOpen}
                      aria-haspopup="true"
                    >
                      {item.name}
                      <ChevronDownIcon 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isServicesDropdownOpen ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50/80 rounded-full transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                    >
                      {item.name}
                    </Link>
                  )}
                  
                  {item.hasDropdown && (
                    <div
                      onMouseEnter={() => setIsServicesDropdownOpen(true)}
                      onMouseLeave={() => setIsServicesDropdownOpen(false)}
                    >
                      <DesktopDropdown
                        isOpen={isServicesDropdownOpen}
                        onClose={() => setIsServicesDropdownOpen(false)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50/80 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div 
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-4 space-y-2">
              {navigationItems.map((item, index) => (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={toggleMobileServices}
                        className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50/80 rounded-2xl transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                        style={{
                          animationDelay: `${index * 0.1}s`
                        }}
                      >
                        <span>{item.name}</span>
                        <ChevronDownIcon 
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isMobileServicesOpen ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      <MobileDropdown isOpen={isMobileServicesOpen} />
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50/80 rounded-2xl transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}