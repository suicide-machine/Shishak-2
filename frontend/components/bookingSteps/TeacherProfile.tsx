import { Teacher } from "@/lib/types"
import React from "react"
import { Card, CardContent } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Award, Star } from "lucide-react"
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

            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold shadow-inner">
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
      </CardContent>
    </Card>
  )
}

export default TeacherProfile
