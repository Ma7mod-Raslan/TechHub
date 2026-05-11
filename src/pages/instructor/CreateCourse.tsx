import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, Plus, X, Menu } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';

import HeaderIcons from '../../components/HeaderIcons';
import Sidebar from '../../components/Sidebar';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';

import { createCourse } from '../../services/courseApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { notifyUpdate } from '../../utils/notifications';
import { getInstructorMenuItems } from './config/instructorMenu';
import AIAssistant from '../../components/AIAssistant';

interface InstructorCreateCourseProps {
  logout: () => void;
  userRole: 'instructor';
}

export default function InstructorCreateCourse({ logout, userRole }: InstructorCreateCourseProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
  });

  const LEVEL_MAP: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.level) newErrors.level = 'Level is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem('accessToken');
    if (!token) { toast.error('Unauthorized'); return; }

    setIsCreating(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('level', LEVEL_MAP[formData.level]);

      if (!formData.thumbnail) { toast.error('Please upload a thumbnail image'); setIsCreating(false); return; }
      data.append('file', formData.thumbnail);

      const course = await createCourse(data);
      if (!course?.id) { toast.error('Course ID not returned from server'); return; }

      const courseId = course.id;

      if (requirements.length > 0) {
        await fetch(`/api/courses/${courseId}/requirements`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: requirements }),
        });
      }

      if (outcomes.length > 0) {
        await fetch(`/api/courses/${courseId}/outcomes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: outcomes }),
        });
      }

      setIsCreating(false);
      notifyUpdate();
      navigate('/instructor/course-view', { state: { courseId } });
    } catch (err: any) {
      console.error(err);
      setIsCreating(false);
      toast.error(err?.response?.data?.error || 'Failed to create course');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token || !user) { navigate('/login', { replace: true }); return; }
    if (user.role !== 'instructor') navigate(`/${user.role}/dashboard`, { replace: true });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          menuItems={getInstructorMenuItems('/instructor/courses')}
          logout={logout}
          userRole="instructor"
          activePage="instructor-courses"
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
                <Button variant="ghost" size="sm" onClick={() => navigate('/instructor/courses')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl">Create New Course</h1>
                  <p className="text-gray-600">Start building your course</p>
                </div>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-6">
            <form onSubmit={handleCreateCourse}>
              <div className="max-w-4xl mx-auto space-y-6">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">📚 Your course will be created as a <strong>draft</strong>. You can add videos, assessments, and other content before publishing it.</p>
                </motion.div>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Course Title *</Label>
                        <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., Complete Python Bootcamp" className={errors.title ? 'border-red-500' : ''} />
                        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                      </div>
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Describe what students will learn in this course..." rows={6} className={errors.description ? 'border-red-500' : ''} />
                        <p className="text-sm text-gray-500 mt-1">{formData.description.length}/50 minimum characters</p>
                        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger className={errors.category ? 'border-red-500' : ''}><SelectValue placeholder="Select category" /></SelectTrigger>
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
                          {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                        </div>
                        <div>
                          <Label htmlFor="level">Difficulty Level *</Label>
                          <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                            <SelectTrigger className={errors.level ? 'border-red-500' : ''}><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level}</p>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl">What you'll learn</h3>
                    <div className="flex gap-2">
                      <Input value={outcomeInput} onChange={(e) => setOutcomeInput(e.target.value)} placeholder="Add learning outcome" />
                      <Button type="button" className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600" onClick={() => { if (!outcomeInput.trim()) return; setOutcomes([...outcomes, outcomeInput]); setOutcomeInput(''); }}>Add</Button>
                    </div>
                    <ul className="list-disc list-inside space-y-1">{outcomes.map((o, i) => <li key={i}>{o}</li>)}</ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl">Requirements</h3>
                    <div className="flex gap-2">
                      <Input value={requirementInput} onChange={(e) => setRequirementInput(e.target.value)} placeholder="Add requirement" />
                      <Button type="button" className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600" onClick={() => { if (!requirementInput.trim()) return; setRequirements([...requirements, requirementInput]); setRequirementInput(''); }}>Add</Button>
                    </div>
                    <ul className="list-disc list-inside space-y-1">{requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl">Course Thumbnail</h3>
                    <p className="text-sm text-gray-600">Upload a thumbnail image from your device.</p>
                    <div>
                      <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                      <label className="flex items-center justify-center w-full max-w-md h-32 border-2 border-dashed rounded-lg cursor-pointer">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setFormData(prev => ({ ...prev, thumbnail: file, thumbnailPreview: URL.createObjectURL(file) }));
                        }} />
                      </label>
                    </div>
                    <div className="flex items-center justify-center w-full max-w-md h-48 border-2 border-dashed rounded-lg bg-gray-50">
                      {formData.thumbnailPreview ? (
                        <ImageWithFallback src={formData.thumbnailPreview} alt="Course thumbnail preview" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-gray-400 text-sm text-center px-4">No image selected</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between pb-8">
                  <Button type="button" variant="outline" onClick={() => navigate('/instructor/courses')}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600" disabled={isCreating}>
                    <Plus className="mr-2 h-5 w-5" />{isCreating ? 'Creating...' : 'Create Course'}
                  </Button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
      <AIAssistant/>
    </div>
  );
}