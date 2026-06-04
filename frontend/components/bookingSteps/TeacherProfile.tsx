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
    <Card className="sticky top-8 shadow-lg border-0">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <Avatar className="w-32 h-32 mx-auto right-4 rign-blue-100">
            <AvatarImage
              src={teacher?.profileImage}
              alt={teacher?.name}
            ></AvatarImage>

            <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600  text-white text-2xl font-bold ">
              {teacher?.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {teacher.name}
          </h2>

          <p className="text-gray-600 mb-1">{teacher.subject}</p>

          <p className="text-sm text-gray-500 mb-2">{teacher.qualification}</p>

          <p className="text-sm text-gray-500 mb-4">
            {teacher.experience} years experience
          </p>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-orange-400 text-orange-400"
                  />
                ))}
              </div>

              <span className="text-sm font-semibold text-gray-700">5.0</span>
            </div>

            <div className="text-sm text-gray-500">New Teacher</div>
          </div>

          <div className="flex justify-center flex-wrap gap-2 mb-6">
            {teacher.isVerified && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <Award className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}

            {teacher.category.map((cat, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-blue-100 text-blue-800"
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
