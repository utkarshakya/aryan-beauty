"use client";

import Link from "next/link";
import { useState } from "react";

const navigationItems = [
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Login", href: "/sign-in" },
];

const serviceCategories = [
  { name: "Hair", href: "/services" },
  { name: "Skin", href: "/services" },
  { name: "Spa", href: "/services" },
  { name: "Nails", href: "/services" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-pink-50 shadow-md">
      <div className="hidden md:flex items-center space-x-1">
        {navigationItems.map((item) => {
          if (item.name === "Services") {
            return (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setIsServicesDropdownOpen(true)}
                onMouseLeave={() => setIsServicesDropdownOpen(false)}
              >
                <button className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors">
                  {item.name}
                </button>
                {isServicesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-pink-100 p-2">
                    {serviceCategories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        className="block px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="px-4 py-2 text-gray-700 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      <button
        className="md:hidden p-2 text-gray-700 hover:text-pink-600"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-expanded={isMobileMenuOpen}
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? "✕" : "☰"}
      </button>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="py-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-700 hover:text-pink-600 hover:bg-pink-100 rounded-xl"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
