import { motion } from 'motion/react';
import { Play, Star, Users, Clock, Award, CheckCircle2, FileText, MessageSquare, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserRole } from '../App';
import { ImageWithFallback } from '../components/Assets/ImageWithFallback';
import { toast } from 'sonner';

interface CourseDetailsProps {
  navigate: (page: string) => void;
  userRole: UserRole;
}

export default function CourseDetails({ navigate, userRole }: CourseDetailsProps) {
  const handleEnroll = () => {
    if (userRole === 'guest') {
      toast.error('Please sign up or log in to enroll in this course');
      setTimeout(() => {
        navigate('signup');
      }, 1000);
    } else if (userRole === 'student') {
      toast.success('Successfully enrolled in the course!');
      setTimeout(() => {
        navigate('student-courses');
      }, 1000);
    } else if (userRole === 'instructor') {
      toast.error('Instructors cannot enroll in courses. Please sign in with a student account.');
    } else if (userRole === 'admin') {
      toast.error('Admins cannot enroll in courses. Please sign in with a student account.');
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-y-auto scrollbar-hide">
      <Navbar navigate={navigate} isLoggedIn={userRole !== 'guest'} userRole={userRole} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-4">Web Development</Badge>
              <h1 className="text-4xl mb-4">Complete Web Development Bootcamp</h1>
              <p className="text-xl text-gray-600 mb-6">
                Learn HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack developer.
              </p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span>4.9 (12,500 ratings)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>45,320 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>42 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>English</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">Created by <span className="text-cyan-600">Sarah Johnson</span></p>
              </div>
            </motion.div>

            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl mb-4">What you'll learn</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        'Build responsive websites with HTML, CSS, and JavaScript',
                        'Master React and modern frontend development',
                        'Create backend APIs with Node.js and Express',
                        'Work with databases like MongoDB and PostgreSQL',
                        'Deploy full-stack applications to the cloud',
                        'Implement authentication and authorization',
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h2 className="text-2xl mb-4">Requirements</h2>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Basic computer skills</li>
                      <li>No prior programming experience needed</li>
                      <li>A computer with internet connection</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl mb-4">Course Curriculum</h2>
                    <Accordion type="single" collapsible>
                      {[
                        { title: 'Introduction to Web Development', lectures: 8, duration: '1h 30m' },
                        { title: 'HTML & CSS Fundamentals', lectures: 12, duration: '2h 45m' },
                        { title: 'JavaScript Basics', lectures: 15, duration: '3h 20m' },
                        { title: 'React Framework', lectures: 18, duration: '4h 15m' },
                        { title: 'Backend with Node.js', lectures: 16, duration: '3h 50m' },
                      ].map((section, index) => (
                        <AccordionItem key={index} value={`section-${index}`}>
                          <AccordionTrigger>
                            <div className="flex items-center justify-between w-full pr-4">
                              <span>{section.title}</span>
                              <span className="text-sm text-gray-600">{section.lectures} lectures • {section.duration}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2 py-2">
                                  <Play className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">Lecture {i + 1}: Sample lesson title</span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1758270704025-0e1a1793e1ca?w=200"
                        alt="Instructor"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="text-2xl mb-2">Sarah Johnson</h2>
                        <p className="text-gray-600 mb-4">Senior Full Stack Developer at Tech Corp</p>
                        <div className="flex gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1"><Star className="h-4 w-4" />4.9 Rating</span>
                          <span className="flex items-center gap-1"><Users className="h-4 w-4" />65K Students</span>
                          <span className="flex items-center gap-1"><Award className="h-4 w-4" />12 Courses</span>
                        </div>
                        <p className="text-gray-600">
                          Sarah is a passionate educator with over 10 years of experience in web development. She has worked with Fortune 500 companies and taught thousands of students worldwide.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl mb-6">Student Reviews</h2>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span>John Doe</span>
                            <span className="text-sm text-gray-500">• 2 days ago</span>
                          </div>
                          <p className="text-gray-600">
                            Excellent course! Very comprehensive and well-structured. The instructor explains everything clearly.
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
              <Card>
                <CardContent className="p-0">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?w=600"
                    alt="Course"
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <div className="text-3xl mb-4">$89.99</div>
                    <Button className="w-full mb-3 bg-gradient-to-r from-cyan-500 to-blue-600" onClick={handleEnroll}>
                      Enroll Now
                    </Button>
                    <Button variant="outline" className="w-full mb-6">
                      Add to Wishlist
                    </Button>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Includes:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>42 hours on-demand video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>15 downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Access to community</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}