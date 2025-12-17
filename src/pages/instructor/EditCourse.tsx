import { useState, useEffect } from 'react';
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
  ArrowLeft,
  Upload,
  Save,
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import AIAssistant from '../../components/AIAssistant';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';

import { UserRole } from '../../App';
import { NavigateFn } from '../../types/Navigation';

interface InstructorEditCourseProps {
  navigate: NavigateFn;
  logout: () => void;
  userRole: UserRole;
  navigationState?: {
    courseId?: number;
  };
}

/**
 * This page allows instructors to edit existing course details.
 */
export default function InstructorEditCourse({
  navigate,
  logout,
  userRole,
  navigationState,
}: InstructorEditCourseProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard' },
    { icon: BookOpen, label: 'My Courses', page: 'instructor-courses', active: true },
    { icon: BarChart3, label: 'Analytics', page: 'instructor-analytics' },
    { icon: Users, label: 'Community', page: 'community' },
    { icon: Bell, label: 'Notifications', page: 'instructor-notifications' },
    { icon: User, label: 'Profile', page: 'instructor-profile' },
    { icon: Settings, label: 'Settings', page: 'instructor-settings' },
    { icon: MessageSquare, label: 'Contact Us', page: 'instructor-contact' },
  ];

  // ✅ Extract courseId safely
  const courseId = navigationState?.courseId ?? 1;

  // Form state (will be replaced with API data)
  const [formData, setFormData] = useState({
    title: 'Complete Web Development Bootcamp',
    description:
      'Learn web development from scratch with hands-on projects and real-world examples.',
    category: 'web',
    level: 'beginner',
    thumbnail:
      'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch course data
  useEffect(() => {
    // API: GET /api/courses/:courseId
    // setFormData(response.data)
  }, [courseId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Mock upload
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: URL.createObjectURL(file),
      }));
      setIsUploading(false);
    }, 1500);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // API: PUT /api/courses/:courseId

    setTimeout(() => {
      setIsSaving(false);
      navigate('instructor-course-view', undefined, { courseId });
    }, 1000);
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
          activePage="instructor-courses"
        />

        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate('instructor-course-view', undefined, { courseId })
                  }
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl">Edit Course</h1>
                  <p className="text-gray-600">Update your course information</p>
                </div>
              </div>

              <HeaderIcons
                navigate={navigate}
                logout={logout}
                userRole={userRole}
              />
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            <form onSubmit={handleSaveCourse}>
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label>Course Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange('title', e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        rows={6}
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange('description', e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(v) =>
                            handleInputChange('category', v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="web">Web Development</SelectItem>
                            <SelectItem value="data">Data Science</SelectItem>
                            <SelectItem value="ai">AI & ML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Level *</Label>
                        <Select
                          value={formData.level}
                          onValueChange={(v) =>
                            handleInputChange('level', v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thumbnail */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {formData.thumbnail && (
                      <ImageWithFallback
                        src={formData.thumbnail}
                        alt="Course thumbnail"
                        className="w-full max-w-md h-48 object-cover rounded-lg"
                      />
                    )}

                    <label className="flex items-center justify-center w-full max-w-md h-32 border-2 border-dashed rounded-lg cursor-pointer">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleThumbnailUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      navigate('instructor-course-view', undefined, { courseId })
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-violet-600 to-cyan-500"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}
