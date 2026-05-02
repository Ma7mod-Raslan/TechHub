import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import AIAssistant from '../components/AIAssistant';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifyUpdate } from '../utils/notifications';


export default function Contact() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!token;
  const userRole = user?.role || 'guest';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}` // لو موجود
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          category,
          message
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success("Message sent successfully ✅");
      notifyUpdate();

      // reset
      setFullName("");
      setEmail("");
      setCategory("");
      setMessage("");

    } catch (err: any) {
      toast.error(err.message);
    }
  };
  const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = '/login';
  };

  const [fullName, setFullName] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoggedIn={isLoggedIn} userRole={userRole} logout={logoutUser} />

      <section className="bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl mb-6">Contact Us</h1>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => setCategory(value)} required>
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
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        required
                        className="mt-1"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div>contact@techhub.com</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div>+1 (555) 123-4567</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-cyan-600" />
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
                  <h3 className="text-xl mb-4">Office Hours</h3>
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
                  <h3 className="text-xl mb-4">Quick Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Need immediate help? Check out our comprehensive help center for instant answers.
                  </p>
                  <Button variant="outline" className="w-full">
                    Visit Help Center
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      <AIAssistant />

      <Footer />
    </div>
  );
}
