import { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, BookOpen, MessageSquare, FileText, Bell, User, Settings, Search, Eye, Trash2, EyeOff, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import Sidebar from '../../components/Sidebar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

interface ReportsProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: string;
}

interface ReportData {
  id: number;
  type: 'Reported Post' | 'Reported Comment';
  name: string;
  email: string;
  category: string;
  message: string;
  date: string;
  status: 'Pending' | 'Resolved';
  hidden: boolean;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Replied' | 'Pending';
}

const initialReportsData: ReportData[] = [
  {
    id: 1,
    type: 'Reported Post',
    name: 'Robert Lee',
    email: 'robert.lee@email.com',
    category: 'Spam',
    message: 'Inappropriate promotional content posted in Web Development community. The user is repeatedly posting links to their own website without contributing to discussions.',
    date: '2024-11-06',
    status: 'Pending',
    hidden: false,
  },
  {
    id: 2,
    type: 'Reported Comment',
    name: 'Sophie Turner',
    email: 'sophie.turner@email.com',
    category: 'Harassment',
    message: 'Offensive comment targeting another user in the discussion thread. The comment contains personal attacks and violates our community guidelines.',
    date: '2024-11-05',
    status: 'Resolved',
    hidden: true,
  },
  {
    id: 3,
    type: 'Reported Post',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    category: 'Inappropriate Content',
    message: 'Post contains inappropriate language and violates community guidelines. The content is not suitable for our educational platform.',
    date: '2024-11-03',
    status: 'Pending',
    hidden: false,
  },
];

const initialContactMessages: ContactMessage[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    subject: 'Technical Support - Video Loading Issue',
    message: 'I am having trouble accessing my course materials. The videos are not loading properly. I have tried refreshing the page and clearing my browser cache, but the issue persists. Can you please help?',
    date: '2024-11-08',
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    subject: 'Billing Inquiry',
    message: 'I was charged twice for the same course. Can you please refund the duplicate charge? My transaction IDs are #12345 and #12346.',
    date: '2024-11-07',
    status: 'Replied',
  },
  {
    id: 3,
    name: 'David Kim',
    email: 'david.kim@email.com',
    subject: 'Code Compiler Error',
    message: 'The code compiler is not working. I get an error every time I try to run my code. The error message says "Runtime error: Cannot compile". Please fix this issue as soon as possible.',
    date: '2024-11-04',
    status: 'New',
  },
  {
    id: 4,
    name: 'Rachel Green',
    email: 'rachel.green@email.com',
    subject: 'Certificate Issue',
    message: 'I completed the course but have not received my certificate yet. It has been 3 days since I finished all the modules. When can I expect to receive it?',
    date: '2024-11-02',
    status: 'Pending',
  },
  {
    id: 5,
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    subject: 'Course Content Question',
    message: 'I have a question about the course content in Section 5. Is there any additional material available for advanced topics? The current material is great but I would like to dive deeper.',
    date: '2024-10-31',
    status: 'Replied',
  },
];

export default function AdminReports({ navigate, logout }: ReportsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState(initialReportsData);
  const [contactMessages, setContactMessages] = useState(initialContactMessages);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null; type: 'report' | 'contact' }>({ 
    show: false, id: null, type: 'report' 
  });
  const [replyText, setReplyText] = useState('');
  const [showReplyDialog, setShowReplyDialog] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'admin-dashboard' },
    { icon: Users, label: 'Users', page: 'admin-users' },
    { icon: BookOpen, label: 'Courses', page: 'admin-courses' },
    { icon: MessageSquare, label: 'Communities', page: 'admin-communities' },
    { icon: FileText, label: 'Reports', page: 'admin-reports', active: true },
    { icon: Bell, label: 'Notifications', page: 'admin-notifications' },
    { icon: User, label: 'Profile', page: 'admin-profile' },
    { icon: Settings, label: 'Settings', page: 'admin-settings' },
  ];

  const filterReports = () => {
    return reports.filter(report => {
      const matchesSearch = 
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const filterContactMessages = () => {
    return contactMessages.filter(message => {
      const matchesSearch = 
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const toggleHide = (id: number) => {
    setReports(reports.map(report => 
      report.id === id ? { ...report, hidden: !report.hidden } : report
    ));
    toast.success('Report visibility updated');
  };

  const confirmDelete = (id: number, type: 'report' | 'contact') => {
    setDeleteConfirm({ show: true, id, type });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.id) {
      if (deleteConfirm.type === 'report') {
        setReports(reports.filter(report => report.id !== deleteConfirm.id));
        toast.success('Report deleted successfully');
      } else {
        setContactMessages(contactMessages.filter(message => message.id !== deleteConfirm.id));
        toast.success('Message deleted successfully');
      }
    }
    setDeleteConfirm({ show: false, id: null, type: 'report' });
  };

  const handleReply = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowReplyDialog(true);
    setReplyText('');
  };

  const sendReply = () => {
    if (selectedMessage && replyText.trim()) {
      setContactMessages(contactMessages.map(msg => 
        msg.id === selectedMessage.id ? { ...msg, status: 'Replied' } : msg
      ));
      toast.success('Reply sent successfully');
      setShowReplyDialog(false);
      setReplyText('');
      setSelectedMessage(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-700';
      case 'Replied':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          navigate={navigate}
          logout={logout}
          userRole="admin"
          activePage="admin-reports"
        />

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">Reports & Messages</h1>
                <p className="text-gray-600">Review contact messages and reported content</p>
              </div>
              <HeaderIcons navigate={navigate} logout={logout} userRole="admin" currentPage="admin-reports" />
            </div>
          </header>

          <main className="p-6">
            <Tabs defaultValue="reports" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="reports">
                  Reported Content ({reports.length})
                </TabsTrigger>
                <TabsTrigger value="contacts">
                  Contact Messages ({contactMessages.length})
                </TabsTrigger>
              </TabsList>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search reported content..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-64">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Spam">Spam</SelectItem>
                          <SelectItem value="Harassment">Harassment</SelectItem>
                          <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Message Excerpt</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filterReports().map((report) => (
                            <TableRow key={report.id} className={report.hidden ? 'opacity-50' : ''}>
                              <TableCell>
                                <Badge className={
                                  report.type === 'Reported Post' 
                                    ? 'bg-orange-100 text-orange-700' 
                                    : 'bg-red-100 text-red-700'
                                }>
                                  {report.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{report.name}</TableCell>
                              <TableCell className="text-gray-600">{report.email}</TableCell>
                              <TableCell>
                                <Badge className="bg-violet-100 text-violet-700">{report.category}</Badge>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <div className="truncate">
                                  {report.message}
                                </div>
                                {report.hidden && (
                                  <Badge className="mt-1 bg-gray-200 text-gray-700">Hidden</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-600">{report.date}</TableCell>
                              <TableCell>
                                <Badge className={report.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                                  {report.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleHide(report.id)}
                                    className={report.hidden 
                                      ? "text-green-600 hover:bg-green-50 border-green-200" 
                                      : "text-gray-600 hover:bg-gray-50"
                                    }
                                    title={report.hidden ? "Unhide" : "Hide"}
                                  >
                                    {report.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedReport(report)}
                                        className="hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-all duration-300"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Report Details</DialogTitle>
                                        <DialogDescription>
                                          Reported by {report.name} on {report.date}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="mt-4 space-y-4">
                                        <div className="flex gap-3 flex-wrap">
                                          <div>
                                            <span className="text-sm text-gray-600">Type: </span>
                                            <Badge className={
                                              report.type === 'Reported Post' 
                                                ? 'bg-orange-100 text-orange-700' 
                                                : 'bg-red-100 text-red-700'
                                            }>
                                              {report.type}
                                            </Badge>
                                          </div>
                                          <div>
                                            <span className="text-sm text-gray-600">Category: </span>
                                            <Badge className="bg-violet-100 text-violet-700">{report.category}</Badge>
                                          </div>
                                          <div>
                                            <span className="text-sm text-gray-600">Status: </span>
                                            <Badge className={report.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                                              {report.status}
                                            </Badge>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600 mb-2">Reporter Email:</p>
                                          <p className="text-sm">{report.email}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600 mb-2">Full Report:</p>
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700">{report.message}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => confirmDelete(report.id, 'report')}
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Messages Tab */}
              <TabsContent value="contacts" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search contact messages..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-64">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Replied">Replied</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Message Preview</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filterContactMessages().map((message) => (
                            <TableRow key={message.id}>
                              <TableCell>{message.name}</TableCell>
                              <TableCell className="text-gray-600">{message.email}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {message.subject}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-gray-600">
                                {message.message}
                              </TableCell>
                              <TableCell className="text-gray-600">{message.date}</TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeClass(message.status)}>
                                  {message.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-all duration-300"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Contact Message</DialogTitle>
                                        <DialogDescription>
                                          From {message.name} ({message.email}) on {message.date}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="mt-4 space-y-4">
                                        <div className="flex gap-3 items-center">
                                          <span className="text-sm text-gray-600">Status: </span>
                                          <Badge className={getStatusBadgeClass(message.status)}>
                                            {message.status}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600 mb-2">Subject:</p>
                                          <p>{message.subject}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600 mb-2">Message:</p>
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700">{message.message}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReply(message)}
                                    className="hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-all duration-300"
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => confirmDelete(message.id, 'contact')}
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <AIAssistant />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.show} onOpenChange={() => setDeleteConfirm({ show: false, id: null, type: 'report' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteConfirm.type === 'report' ? 'Report' : 'Message'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this {deleteConfirm.type === 'report' ? 'report' : 'message'}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Contact Message</DialogTitle>
            <DialogDescription>
              {selectedMessage && `To: ${selectedMessage.name} (${selectedMessage.email})`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Subject:</p>
              <p className="mb-4">{selectedMessage?.subject}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Original Message:</p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 text-sm">{selectedMessage?.message}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Your Reply:</p>
              <Textarea
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full h-40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendReply}
              disabled={!replyText.trim()}
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
