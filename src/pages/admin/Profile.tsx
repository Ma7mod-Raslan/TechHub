import { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  User,
  Settings,
  Code2,
  AlertCircle,
  LogOut,
  Camera,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileText,
  Linkedin,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import Sidebar from '../../components/Sidebar';
import { toast } from 'sonner';

interface AdminProfileProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: string;
}

export default function AdminProfile({ navigate, logout }: AdminProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@techhub.com',
    phone: '+1 (555) 123-4567',
    linkedin: 'https://linkedin.com/in/admin',
    location: 'San Francisco, CA',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling, revert changes
      setFormData({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@techhub.com',
        phone: '+1 (555) 123-4567',
        linkedin: 'https://linkedin.com/in/admin',
        location: 'San Francisco, CA',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    // Save the changes
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'admin-dashboard' },
    { icon: Users, label: 'Users', page: 'admin-users' },
    { icon: BookOpen, label: 'Courses', page: 'admin-courses' },
    { icon: MessageSquare, label: 'Communities', page: 'admin-communities' },
    { icon: FileText, label: 'Reports', page: 'admin-reports' },
    { icon: Bell, label: 'Notifications', page: 'admin-notifications' },
    { icon: User, label: 'Profile', page: 'admin-profile', active: true },
    { icon: Settings, label: 'Settings', page: 'admin-settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="admin"
          activePage="admin-profile"
        />

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">Admin Profile</h1>
                <p className="text-gray-600">Manage your admin profile information</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole="admin" currentPage="admin-profile" />
            </div>
          </header>

          <main className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Profile Header */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1758270704025-0e1a1793e1ca?w=200"
                        alt="Admin"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <button className="absolute bottom-0 right-0 bg-gradient-to-r from-violet-600 to-cyan-500 p-2 rounded-full text-white hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl">Administrator</h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-800 rounded-full">
                          <Shield className="h-4 w-4" />
                          <span className="text-sm">Admin</span>
                        </div>
                      </div>
                      <p className="text-gray-600">admin@techhub.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Information */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          className="pl-10"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue="Admin" disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn URL</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="linkedin"
                          className="pl-10"
                          value={formData.linkedin}
                          onChange={(e) => handleInputChange('linkedin', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          className="pl-10"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    {!isEditing ? (
                      <Button
                        className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                        onClick={handleEditToggle}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleEditToggle}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                          onClick={handleSaveChanges}
                        >
                          Save Changes
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-cyan-50 rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                      <div className="text-2xl mb-1">45,280</div>
                      <div className="text-sm text-gray-600">Total Users Managed</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-cyan-50 rounded-lg">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-cyan-600" />
                      <div className="text-2xl mb-1">1,285</div>
                      <div className="text-sm text-gray-600">Courses Approved</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-cyan-50 rounded-lg">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl mb-1">142</div>
                      <div className="text-sm text-gray-600">Reports Resolved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      
      <AIAssistant />
    </div>
  );
}