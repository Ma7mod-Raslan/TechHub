import { motion } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Users,
  Code,
  Map,
  Bell,
  User,
  Settings,
  Code2,
  Mail,
  Phone,
  MapPin,
  Send,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface StudentContactProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student';
}

export default function StudentContact({ navigate, logout, userRole }: StudentContactProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
    { icon: BookOpen, label: 'Courses', page: 'student-courses' },
    { icon: FileText, label: 'Assignments', page: 'student-assignments' },
    { icon: Award, label: 'Certificates', page: 'student-certificates' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
    { icon: Code, label: 'Compiler', page: 'student-compiler' },
    { icon: Bell, label: 'Notifications', page: 'student-notifications' },
    { icon: User, label: 'Profile', page: 'student-profile' },
    { icon: Settings, label: 'Settings', page: 'student-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'student-contact', active: true },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-contact"
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">Contact Us</h1>
                <p className="text-gray-600">Get in touch with our support team</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-2xl mb-6">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input id="name" placeholder="John Doe" required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input id="email" type="email" placeholder="you@example.com" required className="mt-1" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select required>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="course">Course Question</SelectItem>
                            <SelectItem value="account">Account & Billing</SelectItem>
                            <SelectItem value="certificate">Certificates</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more about your inquiry..."
                          rows={6}
                          required
                          className="mt-1"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                      >
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div>support@techhub.com</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <div>+1 (555) 123-4567</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Address</div>
                          <div>123 Tech Street, San Francisco, CA 94105</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl mb-4">Support Hours</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span>9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saturday</span>
                        <span>10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl mb-4">Quick Help</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Need immediate assistance? Check out our student help center for guides and FAQs.
                    </p>
                    <Button variant="outline" className="w-full">
                      Visit Help Center
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
      
      <AIAssistant />
    </div>
  );
}
