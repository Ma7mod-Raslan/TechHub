import { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
import { motion } from 'motion/react';
import { Code, Database, Brain, Shield, Smartphone, Globe, Users, Award, Star, ChevronRight, BookOpen, TrendingUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import AIAssistant from '../../components/AIAssistant';
import { COURSE_CATEGORIES } from '../../constants/courseCategories';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  isLoggedIn?: boolean;
  userRole?: 'student' | 'instructor' | 'admin' | 'guest';
  logout?: () => void;
}

interface Feedback {
  name: string;
  role: string;
  stars_num: number;
  comment: string;
  profile_image?: string;
}

const categories = [
  { icon: Code, name: 'Web Development', courses: 120, color: 'from-blue-500 to-cyan-500' },
  { icon: Database, name: 'Data Science', courses: 85, color: 'from-purple-500 to-pink-500' },
  { icon: Brain, name: 'AI & Machine Learning', courses: 95, color: 'from-green-500 to-emerald-500' },
  { icon: Shield, name: 'Cybersecurity', courses: 60, color: 'from-red-500 to-orange-500' },
  { icon: Smartphone, name: 'Mobile Development', courses: 70, color: 'from-indigo-500 to-purple-500' },
  { icon: Globe, name: 'Cloud Computing', courses: 55, color: 'from-yellow-500 to-orange-500' },
];


const stats = [
  { icon: Users, label: 'Active Learners', value: '500K+' },
  { icon: BookOpen, label: 'Expert Courses', value: '1,200+' },
  { icon: Award, label: 'Certificates Issued', value: '250K+' },
  { icon: TrendingUp, label: 'Success Rate', value: '95%' },
];

export default function Home({ isLoggedIn = false, userRole = 'guest', logout }: HomeProps) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor'>('student');
  const [allTestimonials, setAllTestimonials] = useState<Feedback[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role || userRole;


  useEffect(() => {
    fetch("/api/feedbacks")
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if (Array.isArray(data) && data.length > 0) {
          setAllTestimonials(data.slice(0, 3));
        }
      })
      .catch(console.error);
  }, []);


  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => {
        const shuffled = [...data.courses].sort(() => 0.5 - Math.random());
        setFeaturedCourses(shuffled.slice(0, 4));
      })
      .catch(err => console.error(err));
  }, []);

  const token = localStorage.getItem("accessToken");


  const handleRoleSelect = (role: 'student' | 'instructor') => {
    setSelectedRole(role);
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden scrollbar-hide">
      <Navbar isLoggedIn={isLoggedIn} userRole={userRole} transparent logout={handleLogout} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-cyan-50 to-blue-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 bg-gradient-to-r from-violet-600 to-cyan-500">
                🚀 Join 500,000+ Learners
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6 bg-gradient-to-r from-gray-900 via-violet-900 to-cyan-900 bg-clip-text text-transparent">
                Master Tech Skills That Matter
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
                Learn from industry experts, build real projects, and accelerate your career in technology with TechHub's comprehensive courses.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                {!isLoggedIn ? (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate('/signup')}
                      className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300 w-full sm:w-auto"
                    >
                      Start Learning
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/courses')}
                      className="transition-all duration-300 w-full sm:w-auto"
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      Browse Courses
                    </Button>

                  </>
                ) : role === 'instructor' ? (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate('/instructor/dashboard')}
                      className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 w-full sm:w-auto"
                    >
                      Start Teaching
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/instructor/courses')} className="w-full sm:w-auto">
                      <BookOpen className="mr-2 h-5 w-5" />
                      My Courses
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate('/student/dashboard')}
                      className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 w-full sm:w-auto"
                    >
                      Start Learning
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/student/courses')} className="w-full sm:w-auto">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Browse Courses
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758525861882-39151c7a9804?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHRlYW13b3JrfGVufDF8fHx8MTc2MjcwNTI5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Learning"
                  className="rounded-2xl shadow-2xl"
                />
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 mb-3">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose TechHub */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">Why Choose TechHub?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're not just another learning platform. We're your partner in tech success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Industry Experts',
                description: 'Learn from professionals working at top tech companies',
                icon: Users,
              },
              {
                title: 'Hands-on Projects',
                description: 'Build real-world applications that showcase your skills',
                icon: Code,
              },
              {
                title: 'Career Support',
                description: 'Get guidance, mentorship, and job placement assistance',
                icon: TrendingUp,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">Explore by Category</h2>
            <p className="text-xl text-gray-600">Find your passion and start learning today</p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-all">
                  <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                      <category.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.courses} courses</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl mb-2">Featured Courses</h2>
              <p className="text-xl text-gray-600">Most popular courses among our learners</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/courses')}>
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => {

                    localStorage.setItem("selectedCourseId", String(course.id));

                    navigate(
                      userRole === 'guest'
                        ? '/course-details-guest'
                        : '/course-details',
                      {
                        state: {
                          courseId: course.id,
                        },
                      }
                    );
                  }}>
                  <div className="relative">
                    <ImageWithFallback
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />

                    <Badge className="absolute top-2 right-2 bg-white text-gray-900">
                      {course.level}
                    </Badge>

                  </div>
                  <CardContent className="p-4">
                    <Badge className="mb-2">
                      {COURSE_CATEGORIES[course.category] ?? course.category}
                    </Badge>
                    <h3 className="mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3"> {course.instructor_name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">What Our Students Say</h2>
            <p className="text-xl text-gray-600">Join thousands of successful learners</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {allTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.stars_num)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">{testimonial.comment}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            testimonial.profile_image ||
                            `https://ui-avatars.com/api/?name=${testimonial.name}`
                          }
                          alt={testimonial.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              `https://ui-avatars.com/api/?name=${testimonial.name}`;
                          }}
                          className="w-12 h-12 rounded-full object-cover border-2 border-violet-200"
                        />

                        <div>
                          <div className="font-medium">
                            {testimonial.name}
                          </div>

                          <div className="text-sm text-gray-600">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <AIAssistant />

      <Footer />
    </div>
  );
}