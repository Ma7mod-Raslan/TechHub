import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  User,
  Settings,
  AlertCircle,
  LogOut,
  Camera,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileText,
  Linkedin,
  Menu,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import Sidebar from '../../components/Sidebar';
import { toast } from 'sonner';

interface AdminProfileProps {
  logout: () => void;
  userRole: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  profile_image?: string;
}

export default function AdminProfile({ logout }: AdminProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [originalData, setOriginalData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    profile_image: '',
  });

  const [formData, setFormData] = useState<ProfileData>({ ...originalData });

  // Fetch admin profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/admin/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');

        const data = await res.json();

        // Map backend fields to form fields
        // Adjust field names based on your actual API response shape
        const mapped: ProfileData = {
          firstName: data.full_name?.split(' ')[0] ?? '',
          lastName: data.full_name?.split(' ').slice(1).join(' ') ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          linkedin: data.linkedin ?? '',
          location: data.location ?? '',
          profile_image: data.profile_image ?? '',
        };

        setOriginalData(mapped);
        setFormData(mapped);
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUploadImage = async (file: File) => {
    if (!file) return;

    try {
      const token = localStorage.getItem("accessToken");

      const body = new FormData();
      body.append("file", file); // مهم الاسم "file"

      const res = await fetch("/api/admin/update-image", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
      } else {
        toast.success("Image updated successfully");

        setFormData(prev => ({
          ...prev,
          profile_image: data.profile_image,
        }));

        setSelectedImage(null);
        setPreviewImage(null);
      }

    } catch (err) {
      toast.error("Image upload failed");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));

    // 👇 الحل الصح
    await handleUploadImage(file);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel — revert to original
      setFormData({ ...originalData });
      setSelectedImage(null);
      setPreviewImage(null);
    }
    setIsEditing(prev => !prev);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch('/api/admin/update-profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          linkedin: formData.linkedin,
          location: formData.location
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed");
      }

      const { data } = result;

      const updated: ProfileData = {
        firstName: data.full_name?.split(' ')[0] ?? formData.firstName,
        lastName: data.full_name?.split(' ').slice(1).join(' ') ?? formData.lastName,
        email: data.email ?? formData.email,
        phone: data.phone ?? formData.phone,
        linkedin: data.linkedin ?? formData.linkedin,
        location: data.location ?? formData.location,
        profile_image: data.profile_image ?? formData.profile_image,
      };

      setOriginalData(updated);
      setFormData(updated);
      setSelectedImage(null);
      setPreviewImage(null);
      setIsEditing(false);

      toast.success('Profile updated successfully!');

    } catch (err) {
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/admin/dashboard' },
    { icon: Users, label: 'Users', page: '/admin/users' },
    { icon: BookOpen, label: 'Courses', page: '/admin/courses' },
    { icon: MessageSquare, label: 'Communities', page: '/admin/communities' },
    { icon: FileText, label: 'Reports', page: '/admin/reports' },
    { icon: Bell, label: 'Notifications', page: '/admin/notifications' },
    { icon: User, label: 'Profile', page: '/admin/profile', active: true },
    { icon: Settings, label: 'Settings', page: '/admin/settings' },
  ];

  const avatarSrc =
    previewImage ||
    (formData.profile_image
      ? `${formData.profile_image}?t=${Date.now()}`
      : 'https://images.unsplash.com/photo-1758270704025-0e1a1793e1ca?w=200');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          logout={logout}
          userRole="admin"
          activePage="admin-dashboard"
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content */}
        <div className="flex-1 w-full">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl">Admin Profile</h1>
                <p className="text-gray-600">Manage your admin profile information</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-profile" />
            </div>
          </header>

          <main className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-violet-600" />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <ImageWithFallback
                          src={avatarSrc}
                          alt="Admin"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                        {(
                          <>
                            <label
                              htmlFor="avatar-upload"
                              className="absolute bottom-0 right-0 bg-gradient-to-r from-violet-600 to-cyan-500 p-2 rounded-full text-white hover:from-violet-700 hover:to-cyan-600 transition-all duration-300 cursor-pointer"
                            >
                              <Camera className="h-4 w-4" />
                            </label>
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl">
                            {formData.firstName} {formData.lastName}
                          </h2>
                          <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-800 rounded-full">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">Admin</span>
                          </div>
                        </div>
                        <p className="text-gray-600">{formData.email}</p>
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
                            className="pl-10 bg-gray-50"
                            value={formData.email}
                            disabled // email is not editable
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" defaultValue="Admin" disabled className="bg-gray-50" />
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
                          <Button variant="outline" onClick={handleEditToggle} disabled={isSaving}>
                            Cancel
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}