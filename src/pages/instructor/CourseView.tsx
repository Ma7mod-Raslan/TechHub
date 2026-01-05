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
  Plus,
  Play,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Upload,
  Save,
  X,
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
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

interface InstructorCourseViewProps {
  navigate: (page: string, role?: UserRole, state?: any) => void;
  logout: () => void;
  userRole: 'instructor';
  navigationState?: any;
}

interface Video {
  id: number;
  title: string;
  video_url: string;
  video_order: number;
}

export default function InstructorCourseView({
  navigate,
  logout,
  userRole,
  navigationState,
}: InstructorCourseViewProps) {
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

  const courseId = navigationState?.courseId ?? null;

  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  if (!courseId) {
    return <div className="p-6 text-red-600">Invalid course</div>;
  }



  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showAddVideoDialog, setShowAddVideoDialog] = useState(false);
  const [showEditVideoDialog, setShowEditVideoDialog] = useState(false);
  const [showDeleteVideoDialog, setShowDeleteVideoDialog] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const [videoFormData, setVideoFormData] = useState({
    title: '',
    url: '',
    order: 1,
  });

  const fetchCourse = async () => {
    const token = localStorage.getItem('accessToken');

    const res = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    setCourse({
      ...data,
      students: 0,
      rating: 0,
      revenue: 0,
    });
  };



  const fetchVideos = async () => {
    const token = localStorage.getItem('accessToken');

    const res = await fetch(
      `http://localhost:3000/api/courses/${courseId}/videos`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );



    const data = await res.json();

    const normalizedVideos = Array.isArray(data)
      ? data
      : Array.isArray(data.videos)
        ? data.videos
        : Array.isArray(data.data)
          ? data.data
          : [];

    setVideos(normalizedVideos);
  };


  useEffect(() => {
    const load = async () => {
      await fetchCourse();
      await fetchVideos();
      setLoading(false);
    };
    load();
  }, [courseId]);

  const handleAddVideo = async () => {
    const token = localStorage.getItem('accessToken');

    await fetch(`http://localhost:3000/api/courses/${courseId}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: videoFormData.title,
        video_url: videoFormData.url,
        video_order: videoFormData.order,
      }),
    });

    await fetchVideos();
    setShowAddVideoDialog(false);
  };

  const handleEditVideo = async () => {
    if (!selectedVideo) return;

    const token = localStorage.getItem('accessToken');

    await fetch(
      `http://localhost:3000/api/courses/${courseId}/videos/${selectedVideo.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: videoFormData.title,
          video_url: videoFormData.url,
          video_order: videoFormData.order,
        }),
      }
    );

    await fetchVideos();
    setShowEditVideoDialog(false);
    setSelectedVideo(null);
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;

    const token = localStorage.getItem('accessToken');

    await fetch(
      `http://localhost:3000/api/courses/${courseId}/videos/${selectedVideo.id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await fetchVideos();
    setShowDeleteVideoDialog(false);
    setSelectedVideo(null);
  };

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    thumbnail: '',
  });

  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    videoTitle: '',
    videoUrl: '',
    videoDuration: '',
  });

  const getCategoryValue = (category: string) => {
    return category?.toLowerCase() ?? '';
  };

  const getCategoryDisplay = (category: string) => {
    return category?.charAt(0).toUpperCase() + category.slice(1);
  };

  const handleCancelEdit = () => {
    setEditFormData({
      title: course.title,
      description: course.description,
      category: getCategoryValue(course.category),
      level: course.level.toLowerCase(),
      thumbnail: course.thumbnail,
    });

    setFormErrors({
      title: '',
      description: '',
      videoTitle: '',
      videoUrl: '',
      videoDuration: '',
    });

    setIsEditMode(false);
  };

  const validateCourseForm = () => {
    let valid = true;
    const errors: any = {};

    if (!editFormData.title.trim()) {
      errors.title = 'Title is required';
      valid = false;
    }

    if (!editFormData.description.trim()) {
      errors.description = 'Description is required';
      valid = false;
    }

    setFormErrors({
      ...formErrors,
      ...errors,
    });

    return valid;
  };



  const handleSaveCourse = async () => {
    if (!validateCourseForm()) return;

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
          body: JSON.stringify({
            title: editFormData.title,
            description: editFormData.description,
            category: editFormData.category,
            level: editFormData.level,
            thumbnail: editFormData.thumbnail,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update course');
      }

      const data = await res.json();

      setCourse(data.course ?? data);

      setIsEditMode(false);
    } catch (error) {
      console.error(error);
      alert('Error while saving course');
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) return <div className="p-6">Loading...</div>;
  if (!course) return null;

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
                {/* DEVELOPER: Back button navigates to instructor-courses */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('instructor-courses')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl">
                    {isEditMode ? 'Edit Course Details' : 'Course Details'}
                  </h1>
                  <p className="text-gray-600">
                    {isEditMode ? 'Update your course information' : 'View and manage your course'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />
                {/* DEVELOPER: Show different buttons based on edit mode */}
                {!isEditMode ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(
                          'instructor-edit-course',
                          'instructor',
                          { courseId }
                        )
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Details
                    </Button>




                    {/* DEVELOPER: Publish button only shows for draft courses */}
                    {course.status === 'draft' && (
                      <Button
                        className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                        onClick={() => setShowPublishDialog(true)}
                      >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Publish Course
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                      onClick={handleSaveCourse}
                      disabled={isSaving}
                    >
                      <Save className="mr-2 h-5 w-5" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>


          {/* Course Info Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Course Image */}
                <div>
                  <ImageWithFallback
                    src={course.thumbnail || 'https://via.placeholder.com/400x250'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Course Details */}
                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-2xl font-semibold">
                    {course.title}
                  </h2>

                  <div className="flex gap-2 flex-wrap">
                    {course.category && (
                      <Badge variant="outline">{course.category}</Badge>
                    )}
                    {course.level && (
                      <Badge variant="outline">{course.level}</Badge>
                    )}
                    {course.status && (
                      <Badge className="bg-yellow-600 text-white">
                        {course.status}
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-600">
                    {course.description || 'No description provided for this course.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


          <main className="p-6">
            {/* Videos Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl">Course Videos</h3>
                  <Button
                    className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                    onClick={() => {
                      setVideoFormData({
                        title: '',
                        url: '',
                        order: videos.length + 1,
                      });
                      setShowAddVideoDialog(true);
                    }}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Video
                  </Button>
                </div>

                {videos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Play className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No videos added yet. Start by adding your first video.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {videos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 text-violet-600">
                            {video.video_order}
                          </div>
                          <div>
                            <h4 className="font-medium">{video.title}</h4>
                            <p className="text-sm text-gray-600">
                              YouTube Video
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedVideo(video);
                              setVideoFormData({
                                title: video.title,
                                url: video.video_url,
                                order: video.video_order,
                              });
                              setShowEditVideoDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedVideo(video);
                              setShowDeleteVideoDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </main>
        </div>
      </div>

      {/* ADD VIDEO */}
      <Dialog open={showAddVideoDialog} onOpenChange={setShowAddVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
          </DialogHeader>
          <Input placeholder="Title" onChange={e => setVideoFormData({ ...videoFormData, title: e.target.value })} />
          <Input placeholder="URL" onChange={e => setVideoFormData({ ...videoFormData, url: e.target.value })} />
          <DialogFooter>
            <Button onClick={handleAddVideo}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT VIDEO */}
      <Dialog open={showEditVideoDialog} onOpenChange={setShowEditVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <Input value={videoFormData.title} onChange={e => setVideoFormData({ ...videoFormData, title: e.target.value })} />
          <Input value={videoFormData.url} onChange={e => setVideoFormData({ ...videoFormData, url: e.target.value })} />
          <DialogFooter>
            <Button onClick={handleEditVideo}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE VIDEO */}
      <Dialog open={showDeleteVideoDialog} onOpenChange={setShowDeleteVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteVideo}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AIAssistant />
    </div>
  );
}
