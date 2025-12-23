"use client"

import { contactInfo, footerSections } from "@/lib/constant"
import { PersonStanding } from "lucide-react"
import React from "react"

const Footer = () => {
  return (
    <footer className="bg-linear-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600  rounded-lg flex items-center justify-center">
                  <PersonStanding className="w-6 h-6 text-white" />
                </div>

                <div className="text-3xl font-bold bg-linear-to-br from-white to-blue-100  bg-clip-text text-transparent">
                  Shikshak
                </div>
              </div>

              <p className="text-blue-100 mb-6 text-lg leading-relaxed">
                Your trusted healthcare partner providing quality medical
                consultations with certified doctors online, anytime, anywhere.
              </p>

              <div className="space-y-3 mb-6">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-white"
                  >
                    <item.icon className="w-4 h-4 text-white" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links section */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {footerSections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-white mb-4 text-lg">
                      {section.title}
                    </h3>

                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a
                            href={link.href}
                            className="text-blue-200 hover:text-white transition-colors duration-200 text-sm hover:underline"
                          >
                            {link.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
