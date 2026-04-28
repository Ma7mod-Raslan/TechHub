import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Bell,
  User,
  Settings,
  MessageSquare,
  Code2,
  Mail,
  Menu,
  Phone,
  MapPin,
  Send,
  LogOut,
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
import { useNavigate } from 'react-router-dom';

interface InstructorContactProps {
  logout: () => void;
  userRole: 'instructor';
}

export default function InstructorContact({ logout, userRole }: InstructorContactProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/instructor/dashboard' },
    { icon: BookOpen, label: 'My Courses', page: '/instructor/courses' },
    { icon: BarChart3, label: 'Assignments', page: '/instructor/assignments' },
    { icon: Users, label: 'Community', page: '/instructor/community' },
    { icon: Bell, label: 'Notifications', page: '/instructor/notifications' },
    { icon: User, label: 'Profile', page: '/instructor/profile' },
    { icon: Settings, label: 'Settings', page: '/instructor/settings' },
    { icon: MessageSquare, label: 'Contact Us', page: '/instructor/contact', active: true },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      full_name: name,
      email: email,
      category: category,
      message: message,
    };

    try {
      if (!name || !email || !category || !message) {
        toast.error("Please fill all fields");
        return;
      }
      setLoading(true);
      const res = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify(formData),
      });



      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Message sent successfully!");
      setName("");
      setEmail("");
      setCategory("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    navigate("/login", { replace: true });
    return;
  }

  if (user.role !== "instructor") {
    navigate(`/${user.role}/dashboard`, { replace: true });
  }
}, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          logout={logout}
          userRole="instructor"
          activePage="instructor-contact"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />


        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div>
                  <h1 className="text-2xl">Contact Us</h1>
                  <p className="text-gray-600">Get in touch with our support team</p>
                </div>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
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
                          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select onValueChange={(val) => setCategory(val)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                            <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                            <SelectItem value="Billing">Billing</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          value={message}
                          placeholder="Tell us more about your inquiry..."
                          onChange={(e) => setMessage(e.target.value)}
                          rows={6}
                          required
                          className="mt-1"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                      >
                        <Send className="mr-2 h-5 w-5" />
                        {loading ? "Sending..." : "Send Message"}
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
                          <div>instructors@techhub.com</div>
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
                      Need immediate assistance? Check out our instructor help center for guides and FAQs.
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
