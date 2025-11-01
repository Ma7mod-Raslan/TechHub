import { Link } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { GraduationCap, Target, Users, Mail, BookOpen, Award, TrendingUp, MessageCircle, Star } from 'lucide-react';
import { ImageWithFallback } from '../../assets/ImageWithFallback';
import { TopNavigation } from '../../components/common/TopNavigation';

export function HomePage() {
  const topCourses = [
    {
      id: 1,
      title: 'Complete React.js Masterclass',
      instructor: 'Dr. Sarah Wilson',
      category: 'Frontend Development',
      level: 'Intermediate',
      students: 12500,
      rating: 4.8,
    },
    {
      id: 2,
      title: 'Python for Data Science',
      instructor: 'Prof. Ahmed Khan',
      category: 'Data Science',
      level: 'Beginner',
      students: 8900,
      rating: 4.9,
    },
    {
      id: 3,
      title: 'Machine Learning Fundamentals',
      instructor: 'Dr. Emily Chen',
      category: 'AI & Machine Learning',
      level: 'Advanced',
      students: 5600,
      rating: 4.7,
    },
  ];

  // Team members
  const teamMembers = [
    {
      name: 'Mahmoud Raslan',
      role: 'Co-Founder & Lead Developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'Toqa',
      role: 'Co-Founder & Product Manager',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b550?w=150&h=150&fit=crop&crop=face',
    },
    {
      name: 'Basmala',
      role: 'Co-Founder & UX Designer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    },
  ];

  // Partner logos (placeholder data)
  const partners = [
    { name: 'TechCorp', logo: 'TC' },
    { name: 'InnovateLabs', logo: 'IL' },
    { name: 'DataSystems', logo: 'DS' },
    { name: 'CloudFirst', logo: 'CF' },
    { name: 'AI Solutions', logo: 'AI' },
    { name: 'DevHub', logo: 'DH' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigation isAuthenticated={false} />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                  Welcome to the Future of Learning
                </div>
                <h1 className="text-5xl">
                  Master New Skills with Expert-Led Courses
                </h1>
                <p className="text-xl text-muted-foreground">
                  Join thousands of learners and instructors building their careers through interactive, hands-on education.
                </p>
                <div className="flex gap-4 pt-4">
                  <Button asChild size="lg">
                    <Link to="/browse">Browse Courses</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/signup?role=instructor">Start Teaching</Link>
                  </Button>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div>
                    <div className="text-3xl text-blue-600">10K+</div>
                    <div className="text-sm text-muted-foreground">Active Students</div>
                  </div>
                  <div>
                    <div className="text-3xl text-blue-600">500+</div>
                    <div className="text-sm text-muted-foreground">Courses</div>
                  </div>
                  <div>
                    <div className="text-3xl text-blue-600">200+</div>
                    <div className="text-sm text-muted-foreground">Instructors</div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1565688695721-2b6f5a880a15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBlZHVjYXRpb24lMjBsZWFybmluZ3xlbnwxfHx8fDE3NTk5ODYyNDh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Online learning platform"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Objective / Goal Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-4xl mb-4">Our Mission</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Empowering learners worldwide to achieve their career goals through accessible, high-quality education
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Interactive Learning</CardTitle>
                  <CardDescription>
                    Hands-on exercises and real-world projects to build practical skills that employers value
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Earn Certificates</CardTitle>
                  <CardDescription>
                    Receive industry-recognized certificates upon course completion to showcase your expertise
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Career Growth</CardTitle>
                  <CardDescription>
                    Learn in-demand skills that help you advance your career and increase your earning potential
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Explore Courses Section */}
        <section id="explore-courses" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-4xl mb-4">Explore Top Courses</h2>
              <p className="text-xl text-muted-foreground">
                Discover our most popular courses and start learning today
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {topCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary">{course.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="mb-2">{course.title}</CardTitle>
                    <CardDescription className="mb-4">
                      by {course.instructor}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students.toLocaleString()} students</span>
                      </div>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={`/courses/${course.id}`}>View More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline">
                <Link to="/browse">Browse All Courses</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Who We Are Section */}
        <section id="who-we-are" className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-4xl mb-4">Who We Are</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                We are a dedicated team of 3 members — 1 boy and 2 girls — passionate about education and technology.
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our platform brings together expert instructors and motivated learners in a collaborative environment designed for success. We're committed to transforming online education and making quality learning accessible to everyone.
              </p>
            </div>

            {/* Team Members */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-8 pb-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="mb-1">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Our Partners Section */}
        <section id="our-partners" className="py-20 px-4 bg-gradient-to-br from-slate-50 to-indigo-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl mb-4">Our Partners</h2>
              <p className="text-xl text-muted-foreground">
                Trusted by leading organizations worldwide
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {partners.map((partner, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-blue-600">{partner.logo}</span>
                  </div>
                  <p className="text-sm text-center">{partner.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact-us" className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-4xl mb-4">Get In Touch</h2>
              <p className="text-xl text-muted-foreground">
                Have questions? We're here to help you on your learning journey
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Enter your name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Enter your message" rows={5} />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="mb-1">Email Support</h4>
                      <p className="text-muted-foreground mb-2">
                        Our support team is available to answer your questions
                      </p>
                      <a href="mailto:support@techhub.com" className="text-blue-600 hover:underline">
                        support@techhub.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="mb-1">Live Chat</h4>
                      <p className="text-muted-foreground mb-2">
                        Get instant help from our AI assistant or support team
                      </p>
                      <Button variant="link" className="p-0 h-auto">
                        Start a conversation
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl mb-6">Ready to Start Learning?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join our community today and take the first step toward achieving your goals
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/signup">Sign Up Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                <Link to="/signup?role=instructor">Start Teaching</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span>TechHub</span>
                </div>
                <p className="text-sm text-slate-400">
                  Empowering learners worldwide through quality education
                </p>
              </div>

              <div>
                <h4 className="mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><Link to="/browse" className="hover:text-white transition">Browse Courses</Link></li>
                  <li><Link to="/signup?role=instructor" className="hover:text-white transition">For Instructors</Link></li>
                  <li><Link to="/signup" className="hover:text-white transition">Become a Student</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#who-we-are" className="hover:text-white transition">About Us</a></li>
                  <li><Link to="/partners" className="hover:text-white transition">Partners</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                  <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
              <p>&copy; 2025 TechHub. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
export default HomePage;
