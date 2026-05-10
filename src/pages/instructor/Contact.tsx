// ============================================================
// Contact.tsx — Instructor Contact (Clean Version)
// ============================================================

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send, Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "sonner";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { sendContactMessage } from "./config/instructorApi";
import { getInstructorMenuItems } from "./config/instructorMenu";

interface Props { logout: () => void; userRole: "instructor"; }

export default function InstructorContact({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "instructor") navigate(`/${u.role}/dashboard`, { replace: true });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !category || !message) { toast.error("Please fill all fields"); return; }
    setLoading(true);
    try {
      await sendContactMessage({ full_name: name, email, category, message });
      toast.success("Message sent successfully!");
      setName(""); setEmail(""); setCategory(""); setMessage("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: <Mail className="h-5 w-5 text-violet-600" />, label: "Email", value: "admin@techhub-learn.com" },
    { icon: <Phone className="h-5 w-5 text-violet-600" />, label: "Phone", value: "+20 112 1662942" },
    { icon: <MapPin className="h-5 w-5 text-violet-600" />, label: "Address", value: "123 Tech Street, Cairo, Egypt " },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar menuItems={getInstructorMenuItems("/instructor/contact")} logout={logout} userRole="instructor" activePage="instructor-contact" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
                <div><h1 className="text-2xl">Contact Us</h1><p className="text-gray-600">Get in touch with our support team</p></div>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
                <Card><CardContent className="p-8">
                  <h2 className="text-2xl mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div><Label>Full Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="mt-1" /></div>
                      <div><Label>Email Address *</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1" /></div>
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select onValueChange={setCategory}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                          {["General Inquiry", "Technical Issue", "Billing", "Other"].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Message *</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us more about your inquiry..." rows={6} required className="mt-1" /></div>
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">
                      <Send className="mr-2 h-5 w-5" />{loading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent></Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <Card><CardContent className="p-6">
                  <h3 className="text-xl mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    {contactInfo.map(({ icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">{icon}</div>
                        <div><div className="text-sm text-gray-600">{label}</div><div>{value}</div></div>
                      </div>
                    ))}
                  </div>
                </CardContent></Card>

                <Card><CardContent className="p-6">
                  <h3 className="text-xl mb-4">Support Hours</h3>
                  <div className="space-y-2 text-sm">
                    {[["Monday - Friday", "9:00 AM - 6:00 PM"], ["Saturday", "10:00 AM - 4:00 PM"], ["Sunday", "Closed"]].map(([day, hours]) => (
                      <div key={day} className="flex justify-between"><span className="text-gray-600">{day}</span><span>{hours}</span></div>
                    ))}
                  </div>
                </CardContent></Card>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}