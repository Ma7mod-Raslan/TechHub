import { useEffect, useState } from 'react';
import { ArrowLeft, Upload, Save, Menu } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';

import Sidebar from '../../components/Sidebar';
import HeaderIcons from '../../components/HeaderIcons';
import { ImageWithFallback } from '../../components/Assets/ImageWithFallback';

import { UserRole } from '../../App';
import { useLocation, useNavigate } from 'react-router-dom';
import { notifyUpdate } from '../../utils/notifications';
import { getInstructorMenuItems } from './config/instructorMenu';
import AIAssistant from '../../components/AIAssistant';

interface InstructorEditCourseProps {
  logout: () => void;
  userRole: UserRole;
}

export default function InstructorEditCourse({ logout, userRole }: InstructorEditCourseProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation() as { state?: { courseId?: number } };
  const courseId = location.state?.courseId ?? null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    thumbnailUrl: '',
    thumbnailFile: null as File | null,
    thumbnailPreview: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!courseId) { setError('Invalid course. No course ID provided.'); setIsLoading(false); return; }

    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`/api/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to load course');
        const data = await res.json();
        setOutcomes(data.outcomes ?? []);
        setRequirements(data.requirements ?? []);
        setFormData({
          title: data.title ?? '',
          description: data.description ?? '',
          category: data.category ?? '',
          level: data.level ?? '',
          thumbnailUrl: data.thumbnail ?? '',
          thumbnailPreview: data.thumbnail ?? '',
          thumbnailFile: null,
        });
      } catch (err) {
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');

      await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: formData.title, description: formData.description, category: formData.category, level: formData.level }),
      });

      await fetch(`/api/courses/${courseId}/requirements`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: requirements }),
      });

      await fetch(`/api/courses/${courseId}/outcomes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: outcomes }),
      });

      if (formData.thumbnailFile) {
        const fd = new FormData();
        fd.append('file', formData.thumbnailFile);
        await fetch(`/api/courses/${courseId}/thumbnail`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      notifyUpdate();
      navigate('/instructor/course-view', { state: { courseId } });
    } catch (error) {
      console.error(error);
      alert('Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token || !user) { navigate('/login', { replace: true }); return; }
    if (user.role !== 'instructor') navigate(`/${user.role}/dashboard`, { replace: true });
  }, []);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="flex h-full">
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
                <Button variant="ghost" size="sm" onClick={() => navigate('/instructor/course-view', { state: { courseId } })}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl">Edit Course</h1>
                  <p className="text-gray-600">Update your course information</p>
                </div>
              </div>
              <HeaderIcons logout={logout} userRole={userRole} />
            </div>
          </header>

          <main className="p-6">
            <form onSubmit={handleSaveCourse}>
              <div className="max-w-4xl mx-auto space-y-6">

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label>Course Title *</Label>
                      <Input value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
                    </div>
                    <div>
                      <Label>Description *</Label>
                      <Textarea rows={6} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Category *</Label>
                        <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
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
                        <Select value={formData.level} onValueChange={(v) => handleInputChange('level', v)}>
                          <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
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

                <Card className="mt-6">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">What you'll learn</h3>
                    <div className="flex gap-2">
                      <Input value={outcomeInput} onChange={(e) => setOutcomeInput(e.target.value)} placeholder="Add learning outcome" />
                      <Button type="button" onClick={() => { if (!outcomeInput.trim()) return; setOutcomes([...outcomes, outcomeInput]); setOutcomeInput(''); }}>Add</Button>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {outcomes.map((o, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{o}</span>
                          <button type="button" className="text-red-500" onClick={() => setOutcomes(outcomes.filter((_, index) => index !== i))}>✕</button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">Requirements</h3>
                    <div className="flex gap-2">
                      <Input value={requirementInput} onChange={(e) => setRequirementInput(e.target.value)} placeholder="Add requirement" />
                      <Button type="button" onClick={() => { if (!requirementInput.trim()) return; setRequirements([...requirements, requirementInput]); setRequirementInput(''); }}>Add</Button>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {requirements.map((r, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{r}</span>
                          <button type="button" className="text-red-500" onClick={() => setRequirements(requirements.filter((_, index) => index !== i))}>✕</button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <Label>Course Thumbnail</Label>
                    <label className="flex items-center justify-center w-full max-w-md h-32 border-2 border-dashed rounded-lg cursor-pointer">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setFormData(prev => ({ ...prev, thumbnailFile: file, thumbnailPreview: URL.createObjectURL(file) }));
                      }} />
                    </label>
                    <div className="flex items-center justify-center w-full max-w-md h-48 border-2 border-dashed rounded-lg bg-gray-50">
                      {formData.thumbnailPreview ? (
                        <ImageWithFallback src={formData.thumbnailPreview} alt="Course thumbnail" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-gray-400 text-sm">No image selected</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => navigate('/instructor/course-view', { state: { courseId } })}>Cancel</Button>
                  <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-violet-600 to-cyan-500">
                    <Save className="mr-2 h-5 w-5" />{isSaving ? 'Saving...' : 'Save Changes'}
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