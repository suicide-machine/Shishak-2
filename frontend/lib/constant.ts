import {
  BookOpen,
  Calendar,
  Clock,
  Facebook,
  FileText,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Target,
  Trophy,
  Twitter,
  Users,
  Video,
} from "lucide-react"

export const subjectCategories = [
  {
    id: "math",
    title: "Mathematics",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    color: "bg-blue-500",
  },
  {
    id: "science",
    title: "Science",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    color: "bg-green-500",
  },
  {
    id: "english-writing",
    title: "English & Writing",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z",
    color: "bg-yellow-500",
  },
  {
    id: "programming",
    title: "Programming & CS",
    icon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    color: "bg-pink-500",
  },
  {
    id: "test-prep",
    title: "Test Prep",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-8h2v6h-2z",
    color: "bg-red-500",
  },
  {
    id: "language",
    title: "Foreign Languages",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
    color: "bg-orange-500",
  },
  {
    id: "humanities",
    title: "Humanities & Arts",
    icon: "M17.5 9.5C17.5 6.5 15 4 12 4S6.5 6.5 6.5 9.5c0 2.89 2.39 5.43 5.5 6.44V17c0 .55.45 1 1 1s1-.45 1-1v-1.06c3.11-1.01 5.5-3.55 5.5-6.44zM12 14.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z",
    color: "bg-purple-500",
  },
  {
    id: "business",
    title: "Business & Finance",
    icon: "M17.5 9.5C17.5 6.5 15 4 12 4S6.5 6.5 6.5 9.5c0 2.89 2.39 5.43 5.5 6.44V20h3v-4.06c3.11-1.01 5.5-3.55 5.5-6.44z",
    color: "bg-indigo-500",
  },
  {
    id: "homework-help",
    title: "Homework Help",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    color: "bg-emerald-500",
  },
]

// Subject categories (matches backend)
// export const subjectCategoriesList = [
//   "Mathematics",
//   "Science",
//   "English & Writing",
//   "Programming & CS",
//   "Test Prep",
//   "Foreign Languages",
//   "Humanities & Arts",
//   "Business & Finance",
//   "Homework Help",
// ]

// export const expertiseLevels = [
//   "Elementary School",
//   "Middle School",
//   "High School",
//   "Undergraduate",
//   "Graduate",
//   "Professional",
//   "Beginner",
//   "Intermediate",
//   "Advanced",
// ]

// export const tutorSpecializations = [
//   "Algebra",
//   "Calculus",
//   "Physics",
//   "Chemistry",
//   "Biology",
//   "English Literature",
//   "Creative Writing",
//   "Python Programming",
//   "Java",
//   "Web Development",
//   "SAT Prep",
//   "ACT Prep",
//   "Spanish",
//   "French",
//   "History",
//   "Economics",
//   "Statistics",
//   "Machine Learning",
//   "Data Science",
//   "Art History",
// ]

// export const testimonials = [
//   {
//     rating: 5,
//     text: "My tutor was incredibly patient and broke down complex calculus problems into simple steps. I went from struggling to getting an A on my final exam!",
//     author: "Alex T.",
//     location: "High School Student",
//     bgColor: "bg-chart-1/10",
//   },
//   {
//     rating: 5,
//     text: "The programming tutor helped me understand concepts I'd been stuck on for weeks. Real-time coding sessions made learning so much more effective.",
//     author: "Sarah K.",
//     location: "Computer Science Major",
//     bgColor: "bg-chart-2/10",
//   },
//   {
//     rating: 5,
//     text: "My English tutor not only improved my essay writing skills but also boosted my confidence. I can now express my ideas clearly and concisely.",
//     author: "Michael R.",
//     location: "College Freshman",
//     bgColor: "bg-chart-4/10",
//   },
//   {
//     rating: 5,
//     text: "Finding a specialized physics tutor was a game-changer. Flexible scheduling allowed me to get help right before exams, and the results showed in my grades.",
//     author: "Jennifer L.",
//     location: "Engineering Student",
//     bgColor: "bg-chart-5/10",
//   },
// ]

// export const faqs = [
//   {
//     question: "How much does a tutoring session cost?",
//     answer:
//       "Prices vary based on tutor experience and subject difficulty, ranging from $20-$80 per hour. We offer subscription plans for regular sessions and bundle discounts. Some tutors also offer free trial sessions.",
//   },
//   {
//     question: "Can I find tutors for specialized subjects?",
//     answer:
//       "Yes! We have tutors for everything from elementary math to graduate-level machine learning, including test prep (SAT, ACT, GRE, GMAT), programming languages, and niche academic subjects.",
//   },
//   {
//     question: "How do I choose the right tutor?",
//     answer:
//       "You can filter by subject, education level, price, ratings, and availability. Each tutor has a detailed profile with credentials, teaching style, reviews, and sample videos. We also offer a matching quiz to find your perfect tutor.",
//   },
//   {
//     question: "What if I'm not satisfied with my tutor?",
//     answer:
//       "We offer a satisfaction guarantee. If you're not happy with your first session, you can request a different tutor or receive a full refund. We also provide progress tracking tools to ensure you're meeting your learning goals.",
//   },
//   {
//     question: "Can I schedule sessions at odd hours?",
//     answer:
//       "Absolutely! Our platform includes tutors from different time zones, so you can find help 24/7. Many tutors offer weekend and late-night sessions for last-minute exam prep.",
//   },
// ]

// export const trustLogos = [
//   "Forbes Education",
//   "EdTech Magazine",
//   "The Chronicle",
//   "Education Week",
//   "TechCrunch",
//   "Wired",
//   "Business Insider EDU",
//   "Inc. Education",
//   "NYT Education",
//   "WSJ Learning",
// ]

// export const contactInfo = [
//   {
//     icon: Phone,
//     text: "1-888-TUTOR-NOW (1-888-888-7669)",
//   },
//   {
//     icon: Mail,
//     text: "support@tutorconnect.com",
//   },
//   {
//     icon: MapPin,
//     text: "Online tutoring available worldwide",
//   },
//   {
//     icon: Clock,
//     text: "24/7 Support Available",
//   },
// ]

// export const footerSections = [
//   {
//     title: "Company",
//     links: [
//       { text: "About Us", href: "/about" },
//       { text: "How It Works", href: "/how-it-works" },
//       { text: "Careers", href: "/careers" },
//       { text: "Blog", href: "/blog" },
//       { text: "Contact Us", href: "/contact" },
//     ],
//   },
//   {
//     title: "For Tutors",
//     links: [
//       { text: "Become a Tutor", href: "/signup/tutor" },
//       { text: "Tutor Resources", href: "/tutor-resources" },
//       { text: "Tutor Dashboard", href: "/tutor/dashboard" },
//       { text: "Pricing for Tutors", href: "/tutor-pricing" },
//     ],
//   },
//   {
//     title: "For Students",
//     links: [
//       { text: "Find Tutors", href: "/tutors" },
//       { text: "Browse Subjects", href: "/subjects" },
//       { text: "Student Dashboard", href: "/student/dashboard" },
//       { text: "Learning Resources", href: "/resources" },
//       { text: "Book Session", href: "/signup/student" },
//     ],
//   },
//   {
//     title: "Legal",
//     links: [
//       { text: "Privacy Policy", href: "/privacy" },
//       { text: "Terms of Service", href: "/terms" },
//       { text: "Cookie Policy", href: "/cookies" },
//       { text: "Academic Integrity", href: "/integrity" },
//     ],
//   },
// ]

// export const socials = [
//   { name: "twitter", icon: Twitter, url: "https://twitter.com/tutorconnect" },
//   {
//     name: "facebook",
//     icon: Facebook,
//     url: "https://facebook.com/tutorconnect",
//   },
//   {
//     name: "linkedin",
//     icon: Linkedin,
//     url: "https://linkedin.com/company/tutorconnect",
//   },
//   {
//     name: "instagram",
//     icon: Instagram,
//     url: "https://instagram.com/tutorconnect",
//   },
// ]

// export const cities = [
//   "New York",
//   "Los Angeles",
//   "Chicago",
//   "Houston",
//   "Phoenix",
//   "Philadelphia",
//   "San Antonio",
//   "San Diego",
// ]

// export const learningApproaches = [
//   {
//     type: "One-on-One Tutoring",
//     icon: Users,
//     description: "Personalized 1:1 session with dedicated tutor",
//     price: 0,
//     recommended: true,
//   },
//   {
//     type: "Group Session",
//     icon: Users,
//     description: "Learn with peers in small groups (2-5 students)",
//     price: -30,
//     recommended: false,
//   },
//   {
//     type: "Self-Paced Course",
//     icon: BookOpen,
//     description: "Pre-recorded lessons with tutor support",
//     price: -50,
//     recommended: false,
//   },
// ]

// export const sessionTypes = [
//   {
//     type: "Video Lesson",
//     icon: Video,
//     description: "Interactive video session with screen sharing",
//     price: 0,
//     recommended: true,
//   },
//   {
//     type: "Audio Session",
//     icon: Phone,
//     description: "Voice-only session for quick questions",
//     price: -40,
//     recommended: false,
//   },
//   {
//     type: "Chat Support",
//     icon: FileText,
//     description: "Text-based help with homework questions",
//     price: -60,
//     recommended: false,
//   },
// ]

// export const emptyStates = {
//   upcoming: {
//     icon: Calendar,
//     title: "No Upcoming Sessions",
//     description: "You have no scheduled tutoring sessions.",
//     action: "Find a Tutor",
//   },
//   completed: {
//     icon: GraduationCap,
//     title: "No Completed Sessions",
//     description: "Your completed learning sessions will appear here.",
//     action: "Book Your First Session",
//   },
//   tutors: {
//     icon: Users,
//     title: "No Tutors Found",
//     description: "Try adjusting your filters or search criteria.",
//     action: "Browse All Tutors",
//   },
// }

// export const getStatusColor = (status: string) => {
//   switch (status.toLowerCase()) {
//     case "scheduled":
//       return "bg-blue-100 text-blue-800"
//     case "confirmed":
//       return "bg-green-100 text-green-800"
//     case "in progress":
//       return "bg-purple-100 text-purple-800"
//     case "completed":
//       return "bg-emerald-100 text-emerald-800"
//     case "cancelled":
//       return "bg-red-100 text-red-800"
//     case "pending payment":
//       return "bg-yellow-100 text-yellow-800"
//     case "rescheduled":
//       return "bg-orange-100 text-orange-800"
//     default:
//       return "bg-gray-100 text-gray-800"
//   }
// }

// export const learningGoals = [
//   {
//     icon: Target,
//     title: "Improve Grades",
//     description: "Boost your GPA and exam scores",
//   },
//   {
//     icon: Trophy,
//     title: "Test Preparation",
//     description: "Ace SAT, ACT, GRE, or other exams",
//   },
//   {
//     icon: BookOpen,
//     title: "Homework Help",
//     description: "Get unstuck on assignments",
//   },
//   {
//     icon: GraduationCap,
//     title: "Skill Building",
//     description: "Learn new subjects or skills",
//   },
// ]

// export const tutorQualifications = [
//   "University Professor",
//   "PhD Holder",
//   "Master's Degree",
//   "Certified Teacher",
//   "Industry Professional",
//   "Graduate Student",
//   "Native Speaker",
//   "Test Prep Expert",
// ]
