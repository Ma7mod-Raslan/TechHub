import { useState } from 'react';
import { motion } from 'motion/react';
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
  Camera,
  Mail,
  Calendar,
  MapPin,
  Link,
  Award,
  TrendingUp,
  DollarSign,
  LogOut,
  Edit,
  X,
  Plus,
  Menu,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import AIAssistant from '../../components/AIAssistant';
import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';

interface InstructorProfileProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: 'instructor';
}

export default function InstructorProfile({ navigate, logout, userRole }: InstructorProfileProps) {
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingExpertise, setEditingExpertise] = useState(false);
  const [editingLinkedIn, setEditingLinkedIn] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [about, setAbout] = useState('Experienced software engineer with 10+ years in full-stack development. Passionate about teaching and helping students achieve their career goals. Specialized in React, Node.js, and cloud technologies. Former senior engineer at top tech companies.');
  const [tempAbout, setTempAbout] = useState(about);

  const [expertise, setExpertise] = useState([
    'JavaScript',
    'React',
    'Node.js',
    'TypeScript',
    'Python',
    'AWS',
    'Docker',
    'MongoDB',
    'PostgreSQL',
    'System Design',
  ]);
  const [tempExpertise, setTempExpertise] = useState([...expertise]);
  const [newSkill, setNewSkill] = useState('');

  const [linkedIn, setLinkedIn] = useState('linkedin.com/in/sarahj');
  const [tempLinkedIn, setTempLinkedIn] = useState(linkedIn);

  const [location, setLocation] = useState('New York, NY');
  const [tempLocation, setTempLocation] = useState(location);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard' },
    { icon: BookOpen, label: 'My Courses', page: 'instructor-courses' },
    { icon: BarChart3, label: 'Analytics', page: 'instructor-analytics' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Bell, label: 'Notifications', page: 'instructor-notifications' },
    { icon: User, label: 'Profile', page: 'instructor-profile' },
    { icon: Settings, label: 'Settings', page: 'instructor-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'instructor-contact' },
  ];

  const stats = [
    { label: 'Total Courses', value: '12', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Total Students', value: '2,980', icon: Users, color: 'text-purple-600' },
    { label: 'Total Revenue', value: '$42.5K', icon: DollarSign, color: 'text-green-600' },
    { label: 'Avg Rating', value: '4.8', icon: Award, color: 'text-yellow-600' },
  ];

  const handleSaveAbout = () => {
    setAbout(tempAbout);
    setEditingAbout(false);
  };

  const handleCancelAbout = () => {
    setTempAbout(about);
    setEditingAbout(false);
  };

  const handleSaveExpertise = () => {
    setExpertise([...tempExpertise]);
    setEditingExpertise(false);
    setNewSkill('');
  };

  const handleCancelExpertise = () => {
    setTempExpertise([...expertise]);
    setEditingExpertise(false);
    setNewSkill('');
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setTempExpertise([...tempExpertise, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setTempExpertise(tempExpertise.filter((_, i) => i !== index));
  };

  const handleSaveLinkedIn = () => {
    setLinkedIn(tempLinkedIn);
    setEditingLinkedIn(false);
  };

  const handleCancelLinkedIn = () => {
    setTempLinkedIn(linkedIn);
    setEditingLinkedIn(false);
  };

  const handleSaveLocation = () => {
    setLocation(tempLocation);
    setEditingLocation(false);
  };

  const handleCancelLocation = () => {
    setTempLocation(location);
    setEditingLocation(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="instructor"
          activePage="instructor-profile"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />


        <div className="flex-1">
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
                  <h1 className="text-2xl">My Profile</h1>
                  <p className="text-gray-600">
                    Manage your professional information
                  </p>
                </div>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} currentPage="profile"/>
            </div>
          </header>


          <main className="p-6">
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-1">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1617153817979-283ffdcd52f5?w=200"
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-violet-100"
                      />
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <h2 className="text-2xl mb-1">Sarah Johnson</h2>
                    <p className="text-gray-600 mb-4">Senior Software Engineer</p>
                    <Badge className="mb-6 bg-gradient-to-r from-violet-600 to-cyan-500">Expert Instructor</Badge>

                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">sarah.johnson@email.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Joined January 2023</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {editingLocation ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={tempLocation}
                              onChange={(e) => setTempLocation(e.target.value)}
                              className="text-sm h-8"
                            />
                          </div>
                        ) : (
                          <span className="text-sm">{location}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Link className="h-4 w-4" />
                        {editingLinkedIn ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={tempLinkedIn}
                              onChange={(e) => setTempLinkedIn(e.target.value)}
                              className="text-sm h-8"
                            />
                          </div>
                        ) : (
                          <span className="text-sm">{linkedIn}</span>
                        )}
                      </div>
                      {(editingLocation || editingLinkedIn) && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (editingLocation) handleSaveLocation();
                              if (editingLinkedIn) handleSaveLinkedIn();
                            }}
                            className="bg-gradient-to-r from-violet-600 to-cyan-500"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (editingLocation) handleCancelLocation();
                              if (editingLinkedIn) handleCancelLinkedIn();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {!editingLocation && !editingLinkedIn && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingLocation(true)}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Location
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingLinkedIn(true)}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit LinkedIn
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button className="w-full mt-6 bg-gradient-to-r from-violet-600 to-cyan-500">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {stats.map((stat, index) => (
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
                      <CardTitle>About</CardTitle>
                      {!editingAbout && (
                        <Button size="sm" variant="outline" onClick={() => setEditingAbout(true)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingAbout ? (
                      <div className="space-y-3">
                        <Textarea
                          value={tempAbout}
                          onChange={(e) => setTempAbout(e.target.value)}
                          rows={5}
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveAbout}
                            className="bg-gradient-to-r from-violet-600 to-cyan-500"
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelAbout}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">{about}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Expertise</CardTitle>
                      {!editingExpertise && (
                        <Button size="sm" variant="outline" onClick={() => setEditingExpertise(true)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
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
                              <button
                                onClick={() => handleRemoveSkill(index)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add new skill..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                          />
                          <Button size="sm" variant="outline" onClick={handleAddSkill}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveExpertise}
                            className="bg-gradient-to-r from-violet-600 to-cyan-500"
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelExpertise}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {expertise.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span>Reached 3,000 students milestone</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-yellow-600" />
                        <span>Maintained 4.8+ rating for 12 months</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <span>Published 12 comprehensive courses</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}