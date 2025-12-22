import React from "react"
import { Button } from "../ui/button"
import Link from "next/link"

const LandingHero = () => {
  return (
    <section className="py-20 px-4 bg-linear-to-b from-blue-50 to-white">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-blue-900 leading-tight mb-6">
          Find the best tutor <br />
          <span className="text-blue-900">around your location</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Expert tutoring that's affordable, with or without a subscription.
          Quality learning, accessible anytime, anywhere.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full px-8 py-3 text-lg"
          >
            Meet your tutor
          </Button>

          <Link href="/login/teacher">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-blue-600 text-blue-600  hover:bg-blue-50 rounded-full px-8 py-3 text-lg"
            >
              Login as Tutor
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LandingHero
