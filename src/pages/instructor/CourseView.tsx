import { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
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
  Menu,
  ChevronUp,
  ChevronDown,
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
import { COURSE_CATEGORIES } from '../../constants/courseCategories';
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
  description?: string;
}


export default function InstructorCourseView({
  navigate,
  logout,
  userRole,
  navigationState,
}: InstructorCourseViewProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard' },
    { icon: BookOpen, label: 'My Courses', page: 'instructor-courses' },
    { icon: BarChart3, label: 'Assignments', page: 'instructor-assignments' },
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
  // MCQ states
  const [showMCQDialog, setShowMCQDialog] = useState(false);

  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState([
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ]);

  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [mcqError, setMcqError] = useState('');




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
    description: '',
    order: 1,
  });

  const [videoErrors, setVideoErrors] = useState({
    title: '',
    url: '',
    description: '',
  });



  const fetchCourse = async () => {
    const token = localStorage.getItem('accessToken');

    const res = await fetch(`${API_URL}/api/courses/${courseId}`, {
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
      `${API_URL}/api/courses/${courseId}/videos`,
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

    setVideos(
      normalizedVideos.sort(
        (a: Video, b: Video) => a.video_order - b.video_order
      )
    );

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
    if (!validateVideoForm()) return;

    const token = localStorage.getItem('accessToken');

    await fetch(`http://localhost:5000/api/courses/${courseId}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: videoFormData.title,
        video_url: videoFormData.url,
        description: videoFormData.description,
        video_order: videoFormData.order,
      }),
    });

    await fetchVideos();
    setShowAddVideoDialog(false);
    setVideoErrors({ title: '', url: '', description: '' });
  };

  useEffect(() => {
    if (!mcqError) return;

    const timer = setTimeout(() => {
      setMcqError('');
    }, 5000);

    return () => clearTimeout(timer);
  }, [mcqError]);



  const validateVideoForm = () => {
    const errors = {
      title: '',
      url: '',
      description: '',
    };

    let isValid = true;

    if (!videoFormData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }

    if (!videoFormData.url.trim()) {
      errors.url = 'URL is required';
      isValid = false;
    }

    if (!videoFormData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    setVideoErrors(errors);
    return isValid;
  };


  const handleEditVideo = async () => {
    if (!selectedVideo) return;
    if (!validateVideoForm()) return;

    const token = localStorage.getItem('accessToken');

    await fetch(
      `${API_URL}/api/courses/${courseId}/videos/${selectedVideo.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: videoFormData.title,
          video_url: videoFormData.url,
          description: videoFormData.description,
          video_order: videoFormData.order,
        }),
      }
    );

    await fetchVideos();
    setShowEditVideoDialog(false);
    setSelectedVideo(null);
    setVideoErrors({ title: '', url: '', description: '' });
  };


  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;

    const token = localStorage.getItem('accessToken');

    await fetch(
      `${API_URL}/api/courses/${courseId}/videos/${selectedVideo.id}`,
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

  const handlePublishCourse = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(
        `${API_URL}/api/courses/${course.id}/publish`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to publish course');
      }

      const data = await res.json();

      setCourse(data.course);
    } catch (error) {
      console.error(error);
      alert('Failed to publish course');
    }
  };


  const handleSaveCourse = async () => {
    if (!validateCourseForm()) return;

    setIsSaving(true);

    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch(
        `${API_URL}/api/courses/${courseId}`,
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


  const moveVideo = async (video: Video, direction: 'up' | 'down') => {
    const token = localStorage.getItem('accessToken');

    const targetOrder =
      direction === 'up'
        ? video.video_order - 1
        : video.video_order + 1;

    // برا الليست
    if (targetOrder < 1 || targetOrder > videos.length) return;

    const targetVideo = videos.find(
      v => v.video_order === targetOrder
    );

    if (!targetVideo) return;

    await fetch(
      `${API_URL}/api/courses/${courseId}/videos/reorder`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId: video.id,
          targetVideoId: targetVideo.id,
        }),
      }
    );

    await fetchVideos();
  };


  const handleAddQuestion = async () => {
    if (!selectedVideo) return;

    if (!questionText.trim()) {
      setMcqError('Question text is required');
      return;
    }

    const correctCount = choices.filter(c => c.is_correct).length;
    if (correctCount !== 1) {
      setMcqError('Please select exactly one correct answer');
      return;
    }

    setMcqError('');

    const token = localStorage.getItem('accessToken');

    const res = await fetch(
      `${API_URL}/api/videos/${selectedVideo.id}/questions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_text: questionText,
          choices,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      setMcqError(err.error || 'Failed to save question');
      return;
    }

    await fetchVideoQuestions(selectedVideo.id);

    setQuestionText('');
    setChoices([
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ]);
  };

  const fetchVideoQuestions = async (videoId: number) => {
    const token = localStorage.getItem('accessToken');
    setLoadingQuestions(true);

    const res = await fetch(
      `${API_URL}/api/videos/${videoId}/questions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : []);
    setLoadingQuestions(false);
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
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="flex-1">
          {/* Header */}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('instructor-courses')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                {/* Title */}
                <div>
                  <h1 className="text-2xl">
                    {isEditMode ? 'Edit Course Details' : 'Course Details'}
                  </h1>
                  <p className="text-gray-600">
                    {isEditMode
                      ? 'Update your course information'
                      : 'View and manage your course'}
                  </p>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                <HeaderIcons navigate={navigate} logout={logout} userRole={userRole} />

                {!isEditMode ? (
                  <>

                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(
                          'instructor-manage-assignment',
                          'instructor',
                          { courseId }
                        )
                      }
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Manage Assignments
                    </Button>
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

                    {course.status === 'Draft' && (
                      <Button
                        onClick={handlePublishCourse}
                        className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                      >
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
                      <Badge variant="outline">
                        {COURSE_CATEGORIES[course.category] ?? course.category}
                      </Badge>
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
                      setSelectedVideo(null);
                      setVideoFormData({
                        title: '',
                        url: '',
                        description: '',
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
                              {video.description}
                            </p>

                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={video.video_order === 1}
                            onClick={() => moveVideo(video, 'up')}
                            className="hover:bg-violet-50"
                          >
                            <ChevronUp className="h-4 w-4 text-gray-600" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={video.video_order === videos.length}
                            onClick={() => moveVideo(video, 'down')}
                            className="hover:bg-violet-50"
                          >
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          </Button>


                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedVideo(video);
                              setQuestionText('');
                              setChoices([
                                { text: '', is_correct: false },
                                { text: '', is_correct: false },
                              ]);
                              fetchVideoQuestions(video.id);
                              setShowMCQDialog(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 text-indigo-600" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedVideo(video);
                              setVideoFormData({
                                title: video.title,
                                url: video.video_url,
                                description: video.description || '',
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

          {/* Title */}
          <Input
            placeholder="Title"
            value={videoFormData.title}
            onChange={e => {
              setVideoFormData({ ...videoFormData, title: e.target.value });
              setVideoErrors({ ...videoErrors, title: '' });
            }}
          />
          {videoErrors.title && (
            <p className="text-sm text-red-600">{videoErrors.title}</p>
          )}


          {/* URL */}
          <Input
            placeholder="URL"
            value={videoFormData.url}
            onChange={e => {
              setVideoFormData({ ...videoFormData, url: e.target.value });
              setVideoErrors({ ...videoErrors, url: '' });
            }}

          />
          {videoErrors.url && (
            <p className="text-sm text-red-600">{videoErrors.url}</p>
          )}

          {/* Description */}
          <Textarea
            placeholder="Description"
            value={videoFormData.description}
            onChange={e => {
              setVideoFormData({ ...videoFormData, description: e.target.value });
              setVideoErrors({ ...videoErrors, description: '' });
            }}

          />
          {videoErrors.description && (
            <p className="text-sm text-red-600">{videoErrors.description}</p>
          )}

          <DialogFooter>
            <Button onClick={handleAddVideo} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* EDIT VIDEO */}
      <Dialog open={showEditVideoDialog} onOpenChange={setShowEditVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>

          {/* Title */}
          <Input
            placeholder="Title"
            value={videoFormData.title}
            onChange={e => {
              setVideoFormData({ ...videoFormData, title: e.target.value });
              setVideoErrors({ ...videoErrors, title: '' });
            }}
          />
          {videoErrors.title && (
            <p className="text-sm text-red-600">{videoErrors.title}</p>
          )}

          {/* URL */}
          <Input
            placeholder="Youtube Video URL"
            value={videoFormData.url}
            onChange={e => {
              setVideoFormData({ ...videoFormData, url: e.target.value });
              setVideoErrors({ ...videoErrors, url: '' });
            }}


          />
          {videoErrors.url && (
            <p className="text-sm text-red-600">{videoErrors.url}</p>
          )}

          {/* Description */}
          <Textarea
            placeholder="Description"
            value={videoFormData.description}
            onChange={e => {
              setVideoFormData({ ...videoFormData, description: e.target.value });
              setVideoErrors({ ...videoErrors, description: '' });
            }}

          />
          {videoErrors.description && (
            <p className="text-sm text-red-600">{videoErrors.description}</p>
          )}

          <DialogFooter>
            <Button onClick={handleEditVideo} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600">Save</Button>
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

      <Dialog open={showMCQDialog} onOpenChange={setShowMCQDialog}>
        <DialogContent className="max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add MCQ Question</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <Label>Question</Label>
            <Textarea
              placeholder="Enter question text"
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
            />

            <div className="space-y-3 mt-4">
              {choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Correct radio */}
                  <input
                    type="radio"
                    name="correct-choice"
                    checked={choice.is_correct}
                    onChange={() =>
                      setChoices(
                        choices.map((c, i) => ({
                          ...c,
                          is_correct: i === index,
                        }))
                      )
                    }
                  />

                  {/* Choice text */}
                  <Input
                    placeholder={`Choice ${index + 1}`}
                    value={choice.text}
                    onChange={e =>
                      setChoices(
                        choices.map((c, i) =>
                          i === index ? { ...c, text: e.target.value } : c
                        )
                      )
                    }
                  />

                  {/* Remove choice */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={choices.length <= 2}
                    onClick={() => {
                      if (choices.length <= 2) return;

                      const newChoices = choices.filter((_, i) => i !== index);

                      if (choice.is_correct) {
                        newChoices.forEach(c => (c.is_correct = false));
                      }

                      setChoices(newChoices);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}

            </div>

            <Button
              variant="outline"
              className="mt-3"
              disabled={choices.length >= 4}
              onClick={() => {
                if (choices.length < 4) {
                  setChoices([...choices, { text: '', is_correct: false }]);
                }
              }}
            >
              + Add Choice
            </Button>


            <div className="mt-6">
              <h4 className="font-semibold mb-2">Existing Questions</h4>

              {loadingQuestions ? (
                <p className="text-sm text-gray-500">Loading questions...</p>
              ) : questions.length === 0 ? (
                <p className="text-sm text-gray-500">No questions added yet.</p>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, index) => (
                    <div
                      key={q.id}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <p className="font-medium">
                        {index + 1}. {q.question_text}
                      </p>

                      <ul className="mt-2 space-y-1">
                        {q.choices.map((c: any) => (
                          <li
                            key={c.id}
                            className="text-sm text-gray-700"
                          >
                            • {c.choice_text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col items-end gap-2 pt-3">
            {mcqError && (
              <div className="flex items-center gap-2 text-red-600 text-sm self-start">
                <AlertCircle className="h-4 w-4" />
                {mcqError}
              </div>
            )}

            <Button onClick={handleAddQuestion} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600" >
              Save Question
            </Button>
          </DialogFooter>
        </DialogContent>

      </Dialog>


      <AIAssistant />
    </div>
  );
}
