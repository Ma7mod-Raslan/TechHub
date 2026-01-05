import { useEffect, useState } from 'react';
import {
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
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Bell,
  User,
  Settings,
  MessageSquare,
} from 'lucide-react';


import Sidebar from '../../components/Sidebar';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';

import { NavigateFn } from '../../types/Navigation';
import { UserRole } from '../../App';



interface InstructorEditCourseProps {
  navigate: NavigateFn;
  logout: () => void;
  userRole: UserRole;
  navigationState?: {
    courseId?: number;
  };
}

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




  /* =======================
     COURSE ID
  ======================= */
  const courseId = navigationState?.courseId ?? null;

  /* =======================
     STATE (ALL HOOKS FIRST)
  ======================= */
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    thumbnail: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState('');



  /* =======================
     HELPERS
  ======================= */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValidImageUrl = (url: string) =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  /* =======================
     FETCH COURSE
  ======================= */
  useEffect(() => {
    if (!courseId) {
      setError('Invalid course. No course ID provided.');
      setIsLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const res = await fetch(
          `http://localhost:3000/api/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error('Failed to load course');

        const data = await res.json();

        setFormData({
          title: data.title ?? '',
          description: data.description ?? '',
          category: data.category ?? '',
          level: data.level ?? '',
          thumbnail: data.thumbnail ?? '',
        });

      } catch (err) {
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  /* =======================
     SAVE COURSE
  ======================= */
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (thumbnailError) return;

    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(
        `http://localhost:3000/api/courses/${courseId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error();

      navigate('instructor-course-view', undefined, { courseId });
    } catch {
      alert('Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  /* =======================
     EARLY RETURNS (SAFE)
  ======================= */
  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
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
                  <p className="text-gray-600">
                    Update your course information
                  </p>
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

                {/* Course Info */}
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
                          onValueChange={(v) => handleInputChange('category', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="web">Web Development</SelectItem>
                            <SelectItem value="data">Data Science</SelectItem>
                            <SelectItem value="ai">AI & ML</SelectItem>
                            <SelectItem value="mobile">Mobile Development</SelectItem>
                            <SelectItem value="security">Cybersecurity</SelectItem>
                            <SelectItem value="cloud">Cloud Computing</SelectItem>
                            <SelectItem value="devops">DevOps</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                          </SelectContent>
                        </Select>

                      </div>

                      <div>
                        <Label>Level *</Label>
                        <Select
                          value={formData.level}
                          onValueChange={(v) => handleInputChange('level', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>

                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thumbnail */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <Label>Thumbnail Image URL</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.thumbnail}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange('thumbnail', value);

                        if (value && !isValidImageUrl(value)) {
                          setThumbnailError(
                            'Please enter a direct image URL (.jpg, .png, .webp)'
                          );
                        } else {
                          setThumbnailError('');
                        }
                      }}
                    />

                    {thumbnailError && (
                      <p className="text-red-600 text-sm">{thumbnailError}</p>
                    )}

                    <div className="flex items-center justify-center w-full max-w-md h-48 border-2 border-dashed rounded-lg bg-gray-50">
                      {formData.thumbnail && !thumbnailError ? (
                        <ImageWithFallback
                          src={formData.thumbnail}
                          alt="Course thumbnail"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Image preview will appear here
                        </span>
                      )}
                    </div>
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
