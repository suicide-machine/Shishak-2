import { Teacher } from "@/lib/types"
import React from "react"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Award, Heart, MapPin, Star } from "lucide-react"
import { Badge } from "../ui/badge"

interface TeacherPrfileInterface {
  teacher: Teacher
}

const TeacherProfile = ({ teacher }: TeacherPrfileInterface) => {
  return (
    <Card className="sticky top-8 shadow-xl rounded-2xl border border-gray-200/60 backdrop-blur-sm bg-white/95 overflow-hidden transition-shadow hover:shadow-2xl">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Avatar className="w-32 h-32 mx-auto ring-4 ring-blue-100 shadow-lg">
            <AvatarImage
              src={teacher?.profileImage}
              alt={teacher?.name}
            ></AvatarImage>

            <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold shadow-inner">
              {teacher?.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
            {teacher.name}
          </h2>

          <p className="text-base font-medium text-gray-700 mb-1">
            {teacher.subject}
          </p>

          <p className="text-sm text-gray-500 mb-1">{teacher.qualification}</p>

          <p className="text-sm text-gray-500 mb-4">
            {teacher.experience} years experience
          </p>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-sm"
                  />
                ))}
              </div>

              <span className="text-sm font-bold text-amber-600">5.0</span>
            </div>

            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              New Teacher
            </div>
          </div>

          <div className="flex justify-center flex-wrap gap-2 mb-6">
            {teacher.isVerified && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-default"
              >
                <Award className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}

            {teacher.category.map((cat, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-default"
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-x-4 flex flex-col  flex-wrap items-stretch sm:space-x-0 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg flex-1 min-w-0 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <h3 className="font-semibold text-gray-900 mb-2 tracking-tight">
              About
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {teacher.about}
            </p>
          </div>

          {teacher.locationInfo && (
            <div className="bf-gray-50 p-4 rounded-lg flex-1 min-w-0 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-2 tracking-tight">
                Location:
              </h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{teacher.locationInfo.name}</p>
                <p className="leading-relaxed">
                  {teacher.locationInfo.address}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">
                    {teacher.locationInfo.city}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-linear-to-br from-green-50 to-green-100 rounded-lg flex-1 min-w-0 shadow-sm border border-green-200 hover:shadow-lg transition-shadow duration-300">
            <div>
              <p className="text-sm text-green-700 font-medium">Tution Fee</p>
              <p className="text-2xl text-green-800 font-bold">
                ₹{teacher.hourlyRate}
              </p>
              <p className="text-xs text-green-600 font-medium">
                {teacher.slotDurationMinutes} minutes class
              </p>
            </div>
            <div className="text-green-600">
              <Heart className="w-8 h-8 cursor-pointer transition-all hover:scale-110 text-green-600 hover:text-red-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TeacherProfile
