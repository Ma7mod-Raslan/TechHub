// ============================================================
// Certificates.tsx — Student Certificates
// ============================================================

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Trophy, Download, Share2, Menu, CheckCheck } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import AIAssistant from "../../components/AIAssistant";
import HeaderIcons from "../../components/HeaderIcons";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { fetchMyCertificates } from "../student/config/studentApi";
import { getStudentMenuItems } from "../student/config/studentMenu";

interface Props { logout: () => void; userRole: "student"; }

interface Certificate {
  id: number;
  course_title: string;
  certificate_link: string;
  issued_at: string;
  certificate_code: string;
}

export default function StudentCertificates({ logout, userRole }: Props) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("accessToken") || !u) { navigate("/login", { replace: true }); return; }
    if (u.role !== "student") navigate(`/${u.role}/dashboard`, { replace: true });
    fetchMyCertificates().then((data: any) => setCertificates(data)).catch(console.error);
  }, []);

  const handleShare = (cert: Certificate) => {
    // Build the full public URL — cert.certificate_link is already /uploads/certificates/file.pdf
    const fullUrl = `${window.location.origin}${cert.certificate_link}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(cert.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        <Sidebar menuItems={getStudentMenuItems("/student/certificates")} logout={logout} userRole="student" activePage="student-certificates" isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1 lg:ml-0 w-full">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0" onClick={() => setIsMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl">My Certificates</h1>
                <p className="text-gray-600 text-sm md:text-base">Your achievements and completed courses</p>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-4 md:p-6">
            {certificates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600 mb-4">Complete courses to earn certificates</p>
                  <Button type="button" onClick={() => navigate("/student/courses")} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">Browse Courses</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 p-8 text-white text-center">
                      <Trophy className="h-16 w-16 mx-auto mb-4" />
                      <h2 className="text-2xl mb-2">Certificate of Completion</h2>
                      <div className="text-xl mb-2">{cert.course_title}</div>
                      <p className="text-sm opacity-90">{new Date(cert.issued_at).toLocaleDateString()}</p>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-400 text-center mb-3 font-mono tracking-wide">
                        ID: {cert.certificate_code}
                      </p>
                      <div className="flex gap-2">

                        {/*
                          ✅ FIX: cert.certificate_link is already "/uploads/certificates/file.pdf"
                          — use it directly as the href, no /api/ prefix needed.
                          Nginx proxies /uploads/ → backend → Express static middleware.
                        */}
                        <a
                          href={cert.certificate_link}
                          download={`${cert.certificate_code}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full hover:bg-gray-100">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                        </a>

                        <Button
                          variant="outline"
                          className="flex-1 hover:bg-gray-100"
                          onClick={() => handleShare(cert)}
                        >
                          {copiedId === cert.id
                            ? <><CheckCheck className="mr-2 h-4 w-4 text-green-500" />Copied!</>
                            : <><Share2 className="mr-2 h-4 w-4" />Share</>
                          }
                        </Button>

                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}