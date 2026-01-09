import { useEffect, useRef, useState } from 'react';
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
  Camera,
  Mail,
  Calendar,
  MapPin,
  Link,
  TrendingUp,
  ArrowRight,
  LogOut,
  MessageSquare,
  Menu,
  Edit2,
  Edit,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import { motion } from 'motion/react';

interface StudentProfileProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'student';
}

export default function StudentProfile({ navigate, logout, userRole }: StudentProfileProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);




  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
    { icon: BookOpen, label: 'Courses', page: 'student-courses' },
    { icon: FileText, label: 'Assignments', page: 'student-assignments' },
    { icon: Award, label: 'Certificates', page: 'student-certificates' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
    { icon: Code, label: 'Compiler', page: 'student-compiler' },
    { icon: Bell, label: 'Notifications', page: 'student-notifications' },
    { icon: User, label: 'Profile', page: 'student-profile', active: true },
    { icon: Settings, label: 'Settings', page: 'student-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
  ];

  useEffect(() => {

    fetch('http://localhost:3000/api/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setBio(data.bio || '');
      });

  }, []);

  useEffect(() => {

    fetch('http://localhost:3000/api/me/stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

      .then(res => res.json())
      .then(data => setStats(data));
  }, []);


  useEffect(() => {

    fetch('http://localhost:3000/api/me/my-courses', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:3000/api/me/profile-image', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      const data = await res.json();

      setProfile((prev: any) => ({
        ...prev,
        profile_image: data.profile_image,
      }));
    } catch (err) {
      console.error('Upload error', err);
    }
  };


  const handleSaveBio = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ bio }),
      });

      if (!res.ok) {
        console.error('Failed to update bio');
        return;
      }

      setProfile((prev: any) => ({
        ...prev,
        bio,
      }));

      setIsEditingBio(false);
    } catch (err) {
      console.error('Bio update error', err);
    }
  };







  const handleLogout = () => {
    logout();
    navigate('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="student"
          activePage="student-profile"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 lg:ml-0 w-full">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex-1">
                <h1 className="text-xl md:text-2xl">My Profile</h1>
                <p className="text-gray-600 text-sm md:text-base">Manage your personal information</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} currentPage="profile" />
            </div>
          </header>

          <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Profile Info Card */}
              <Card className="lg:col-span-1">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <ImageWithFallback
                        src={profile?.profile_image}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-violet-100"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        hidden
                        onChange={handleImageUpload}
                      />

                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>


                    </div>
                    <h2 className="text-2xl mb-1">{profile?.full_name}</h2>

                    {/* Bio + Edit icon */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-gray-600 text-sm">
                        {profile?.bio || 'No bio yet'}
                      </p>

                      <button
                        onClick={() => setIsEditingBio(true)}
                        className="p-1.5 hover:bg-gray-100 transition"
                        title="Edit bio"
                      >
                        <Edit className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>

                    {/* Edit bio form */}
                    {isEditingBio && (
                      <>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full border rounded-md p-2 text-sm"
                          rows={3}
                          placeholder="Write something about yourself..."
                        />

                        <div className="flex gap-2 mt-2 justify-center">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-violet-600 to-cyan-500"
                            onClick={handleSaveBio}
                          >
                            Save
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIsEditingBio(false);
                              setBio(profile?.bio || '');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}



                    <Badge className="mb-6 bg-gradient-to-r from-violet-600 to-cyan-500">Student</Badge>

                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{profile?.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Joined {profile && new Date(profile.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats & Achievements */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                      <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-cyan-50 rounded-lg">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                        <div className="text-2xl mb-1">
                          {stats?.total_enrolled_courses ?? 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Enrolled Courses
                        </div>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-cyan-50 rounded-lg">
                        <Award className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                        <div className="text-2xl mb-1">
                          {stats?.total_completed_courses ?? 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Completed Courses
                        </div>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-cyan-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                        <div className="text-2xl mb-1">
                          {stats?.total_time_spent_hours ?? 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Learning Hours
                        </div>
                      </div>

                    </div>

                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Current Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courses.map(course => (
                        <div key={course.id}>
                          <div className="flex justify-between mb-2">
                            <span>{course.title}</span>
                            <span>{course.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${course.progress_percentage}%` }}
                              transition={{ duration: 0.5 }}
                              className="bg-gradient-to-r from-violet-600 to-cyan-500 h-2.5 rounded-full"
                            />
                          </div>
                        </div>
                      ))}

                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div >
      <AIAssistant />
    </div >
  );
}