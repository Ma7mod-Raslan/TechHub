import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen, Users, Bell, User, Camera, Mail, Calendar,
  Link, TrendingUp, Edit, X, Plus, Menu,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { getInstructorMenuItems } from './config/instructorMenu';

interface InstructorProfileProps {
  logout: () => void;
  userRole: 'instructor';
}

interface InstructorStats {
  total_courses: number;
  total_students: number;
}

export default function InstructorProfile({ logout, userRole }: InstructorProfileProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [expertise, setExpertise] = useState<string[]>([]);
  const [tempExpertise, setTempExpertise] = useState<string[]>([]);
  const [editingExpertise, setEditingExpertise] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [isEditingMain, setIsEditingMain] = useState(false);

  const [tempProfile, setTempProfile] = useState({
    full_name: '', bio: '', linkedin: '',
  });

  const statsCards = stats ? [
    { label: 'Total Courses', value: stats.total_courses, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Total Students', value: stats.total_students, icon: Users, color: 'text-purple-600' },
  ] : [];

  const handleSaveExpertise = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      console.log("💾 Saving expertise:", tempExpertise);

      const response = await fetch('/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          expertise: tempExpertise
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save expertise');
      }

      const data = await response.json();
      console.log("✅ Response from server:", data);

      // تحديث البيانات من الـ Response مباشرة
      if (data.instructor_profile?.expertise) {
        console.log("📌 Updating expertise from response:", data.instructor_profile.expertise);
        setExpertise(data.instructor_profile.expertise);
        setTempExpertise(data.instructor_profile.expertise);
      }

      // أيضاً استدعي fetchProfile للتأكد من التحديث
      await fetchProfile();

      setEditingExpertise(false);
    } catch (err) {
      console.error("❌ Error saving expertise:", err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save expertise');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelExpertise = () => {
    setTempExpertise([...expertise]);
    setEditingExpertise(false);
    setNewSkill('');
  };

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (!skill || tempExpertise.includes(skill)) return;
    setTempExpertise([...tempExpertise, skill]);
    setNewSkill('');
  };

  const handleRemoveSkill = (index: number) => {
    setTempExpertise(tempExpertise.filter((_, i) => i !== index));
  };

  const fetchStats = async () => {
    const res = await fetch('/api/instructor/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    const data = await res.json();
    setStats(data);
  };

  const fetchProfile = async () => {
    const res = await fetch('/api/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    const data = await res.json();
    setProfile(data);
    setTempProfile({
      full_name: data.full_name ?? '',
      bio: data.bio ?? '',
      linkedin: data.instructor_profile?.linkedin ?? '',
    });
    const rawExpertise = data.instructor_profile?.expertise;
    const expertiseFromDB = Array.isArray(rawExpertise) ? rawExpertise : [];
    setExpertise(expertiseFromDB);
    setTempExpertise(expertiseFromDB);
  };

  const handleSaveMain = async () => {
    await fetch('/api/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      body: JSON.stringify({ full_name: tempProfile.full_name, bio: tempProfile.bio, linkedin: tempProfile.linkedin }),
    });
    setIsEditingMain(false);
    fetchProfile();
  };

  const handleCancelMain = () => {
    setTempProfile({
      full_name: profile.full_name ?? '',
      bio: profile.bio ?? '',
      linkedin: profile.instructor_profile?.linkedin ?? '',
    });
    setIsEditingMain(false);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    const res = await fetch('/api/me/profile-image', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      body: formData,
    });
    if (!res.ok) { console.error('Upload failed'); return; }
    fetchProfile();
  };

  useEffect(() => { setTempExpertise(expertise); }, [expertise]);
  useEffect(() => { fetchProfile(); fetchStats(); }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token || !user) { navigate('/login', { replace: true }); return; }
    if (user.role !== 'instructor') navigate(`/${user.role}/dashboard`, { replace: true });
  }, []);

  if (!profile) return <div className="p-10 text-center text-gray-600">Loading profile...</div>;

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="flex h-full">
        <Sidebar
          menuItems={getInstructorMenuItems('/instructor/profile')}
          logout={logout}
          userRole="instructor"
          activePage="instructor-profile"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1 overflow-y-auto">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl">My Profile</h1>
                  <p className="text-gray-600">Manage your professional information</p>
                </div>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} currentPage="profile" />
            </div>
          </header>

          <main className="p-6">
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-1">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <ImageWithFallback
                        src={profile.profile_image || 'https://images.unsplash.com/photo-1617153817979-283ffdcd52f5?w=200'}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-violet-100"
                      />
                      <input type="file" accept="image/*" id="profileImageInput" hidden onChange={handleUploadImage} />
                      <Button size="icon" onClick={() => document.getElementById('profileImageInput')?.click()} className="absolute bottom-0 right-0 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>

                    {!isEditingMain && (
                      <>
                        <h2 className="text-2xl mb-1">{profile.full_name}</h2>
                        <p className="text-gray-600 mb-3">{profile.bio || 'No bio yet'}</p>
                        <Badge className="mb-4 bg-gradient-to-r from-violet-600 to-cyan-500">Instructor</Badge>
                        <div className="text-sm text-gray-600 space-y-1 mb-4">
                          <div className="flex justify-center gap-2"><Mail className="h-4 w-4" />{profile.email}</div>
                          <div className="flex justify-center gap-2"><Calendar className="h-4 w-4" />Joined {new Date(profile.created_at).toLocaleDateString()}</div>
                          {profile.instructor_profile?.linkedin && (
                            <div className="flex justify-center gap-2">
                              <Link className="h-4 w-4" />
                              <a href={profile.instructor_profile.linkedin} target="_blank" className="text-blue-600 hover:underline">LinkedIn</a>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingMain(true)}>
                          <Edit className="h-4 w-4 mr-1" />Edit Profile
                        </Button>
                      </>
                    )}

                    {isEditingMain && (
                      <div className="mt-4 p-4 rounded-lg border bg-gray-50 text-left space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">Edit Profile</h3>
                        <Input placeholder="Full name" value={tempProfile.full_name} onChange={(e) => setTempProfile({ ...tempProfile, full_name: e.target.value })} />
                        <Textarea placeholder="Bio" value={tempProfile.bio} onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })} />
                        <Input placeholder="LinkedIn profile" value={tempProfile.linkedin} onChange={(e) => setTempProfile({ ...tempProfile, linkedin: e.target.value })} />
                        <div className="flex gap-2 justify-end pt-2">
                          <Button size="sm" className="bg-gradient-to-r from-violet-600 to-cyan-500" onClick={handleSaveMain}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelMain}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader><CardTitle>Teaching Statistics</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {statsCards.map((stat, index) => (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                          <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                          <div className="text-2xl mb-1">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Expertise</CardTitle>
                      {!editingExpertise && (
                        <Button size="sm" variant="outline" onClick={() => { setTempExpertise(expertise); setEditingExpertise(true); }}>
                          <Edit className="h-4 w-4 mr-1" />Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingExpertise ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tempExpertise.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="pr-1">
                              {skill}
                              <button onClick={() => handleRemoveSkill(index)} className="ml-1 hover:text-red-600">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="Add new skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()} />
                          <Button size="sm" variant="outline" onClick={handleAddSkill}><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveExpertise} className="bg-gradient-to-r from-violet-600 to-cyan-500">Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelExpertise}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {expertise.map((skill, index) => <Badge key={index} variant="secondary">{skill}</Badge>)}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Recent Achievements</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats && stats.total_students > 0 && (
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span>Reached {stats.total_students} students milestone</span>
                        </div>
                      )}
                      {stats && stats.total_courses > 0 && (
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <span>Published {stats.total_courses} courses</span>
                        </div>
                      )}
                      {stats && stats.total_courses === 0 && stats.total_students === 0 && (
                        <div className="text-sm text-gray-500">No achievements yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}