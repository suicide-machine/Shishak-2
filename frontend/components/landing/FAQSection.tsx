"use client"

import { trustLogos } from "@/lib/constant"
import React, { useState } from "react"

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary mb-12">
            Trusted by millions since 2010
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
            {trustLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-16 text-muted-foreground font-medium text-sm opacity-60 hover:opacity-80 transition-opacity duration-200"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
