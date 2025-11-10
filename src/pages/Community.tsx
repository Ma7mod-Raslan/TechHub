import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ThumbsUp, MessageCircle, Search, Plus, TrendingUp, Users, Code2, Sparkles, LayoutDashboard, BookOpen, FileText, Award, Map, Code, Bell, User, Settings, LogOut, BarChart3, Shield, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { UserRole } from '../App';
import { ImageWithFallback } from '../components/Assets/ImageWithFallback';
import AIAssistant from '../components/AIAssistant';
import HeaderIcons from '../components/HeaderIcons';
import { toast } from 'sonner';
import Sidebar from '../components/Sidebar';

interface CommunityProps {
  navigate: (page: string) => void;
  logout: () => void;
  userRole: UserRole;
  initialCommunityId?: number;
}

// Community data - each represents a course community
const communities = [
  {
    id: 1,
    courseName: 'Complete Web Development Bootcamp',
    thumbnail: 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjI2MTM4NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    topic: 'Web Development',
    members: 1250,
    posts: 342,
  },
  {
    id: 2,
    courseName: 'Machine Learning A-Z',
    thumbnail: 'https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBwYXR0ZXJufGVufDF8fHx8MTc2MjY0NjI5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    topic: 'AI & ML',
    members: 980,
    posts: 256,
  },
  {
    id: 3,
    courseName: 'Python for Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1762330910399-95caa55acf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZWR1Y2F0aW9uJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzYyNzAxOTc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    topic: 'Data Science',
    members: 1520,
    posts: 428,
  },
  {
    id: 4,
    courseName: 'iOS App Development with Swift',
    thumbnail: 'https://images.unsplash.com/photo-1646153114001-495dfb56506d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjB0ZWNofGVufDF8fHx8MTc2MjYxMjQyOXww&ixlib=rb-4.1.0&q=80&w=1080',
    topic: 'Mobile Development',
    members: 750,
    posts: 189,
  },
  {
    id: 5,
    courseName: 'Cybersecurity Fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1758525861882-39151c7a9804?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHRlYW13b3JrfGVufDF8fHx8MTc2MjcwNTI5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    topic: 'Cybersecurity',
    members: 620,
    posts: 145,
  },
  {
    id: 6,
    courseName: 'Cloud Computing with AWS',
    thumbnail: 'https://images.unsplash.com/photo-1675495277087-10598bf7bcd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjI2MTM4NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    topic: 'Cloud Computing',
    members: 890,
    posts: 234,
  },
];

export default function Community({ navigate, logout, userRole, initialCommunityId }: CommunityProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(initialCommunityId || null);
  const [hiddenPosts, setHiddenPosts] = useState<number[]>([]);
  const [selectedThread, setSelectedThread] = useState<number | null>(null);
  const [hiddenReplies, setHiddenReplies] = useState<number[]>([]);

  const handleHidePost = (postId: number) => {
    if (hiddenPosts.includes(postId)) {
      setHiddenPosts(hiddenPosts.filter(id => id !== postId));
      toast.success('Post shown successfully');
    } else {
      setHiddenPosts([...hiddenPosts, postId]);
      toast.success('Post hidden successfully');
    }
  };

  const handleDeletePost = (postId: number) => {
    toast.success('Post deleted successfully');
    // In a real app, this would remove the post from the list
  };

  const handleHideReply = (replyId: number) => {
    if (hiddenReplies.includes(replyId)) {
      setHiddenReplies(hiddenReplies.filter(id => id !== replyId));
      toast.success('Reply shown successfully');
    } else {
      setHiddenReplies([...hiddenReplies, replyId]);
      toast.success('Reply hidden successfully');
    }
  };

  const handleDeleteReply = (replyId: number) => {
    toast.success('Reply deleted successfully');
    // In a real app, this would remove the reply from the list
  };

  const handleBackToCommunities = () => {
    if (userRole === 'admin') {
      // Return to admin community management page
      navigate('admin-communities');
    } else {
      // Return to community list view
      setSelectedCommunity(null);
    }
  };

  const menuItems = userRole === 'admin'
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', page: 'admin-dashboard' },
        { icon: Users, label: 'Users', page: 'admin-users' },
        { icon: BookOpen, label: 'Courses', page: 'admin-courses' },
        { icon: MessageSquare, label: 'Communities', page: 'admin-communities', active: selectedCommunity !== null || selectedThread !== null },
        { icon: FileText, label: 'Reports', page: 'admin-reports' },
        { icon: Bell, label: 'Notifications', page: 'admin-notifications' },
        { icon: User, label: 'Profile', page: 'admin-profile' },
        { icon: Settings, label: 'Settings', page: 'admin-settings' },
      ]
    : userRole === 'instructor' 
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', page: 'instructor-dashboard' },
        { icon: BookOpen, label: 'My Courses', page: 'instructor-courses' },
        { icon: BarChart3, label: 'Analytics', page: 'instructor-analytics' },
        { icon: Users, label: 'Community', page: 'community', active: true },
        { icon: Bell, label: 'Notifications', page: 'instructor-notifications' },
        { icon: User, label: 'Profile', page: 'instructor-profile' },
        { icon: Settings, label: 'Settings', page: 'instructor-settings' },
        { icon: MessageSquare, label: 'Contact Us', page: 'instructor-contact' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', page: 'student-dashboard' },
        { icon: BookOpen, label: 'My Courses', page: 'student-courses' },
        { icon: FileText, label: 'Assignments', page: 'student-assignments' },
        { icon: Award, label: 'Certificates', page: 'student-certificates' },
        { icon: Users, label: 'Community', page: 'community', active: true },
        { icon: Map, label: 'Roadmaps', page: 'student-roadmaps' },
        { icon: Code, label: 'Compiler', page: 'student-compiler' },
        { icon: Bell, label: 'Notifications', page: 'student-notifications' },
        { icon: User, label: 'Profile', page: 'student-profile' },
        { icon: Settings, label: 'Settings', page: 'student-settings' },
        { icon: MessageSquare, label: 'Contact Us', page: 'student-contact' },
      ];

  // Mock replies data
  const mockReplies = [
    {
      id: 1,
      author: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      content: 'I found this really helpful! Make sure to check out the documentation in Module 2.',
      likes: 15,
      time: '1 hour ago',
    },
    {
      id: 2,
      author: 'Alex Turner',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
      content: 'Thanks for sharing! This cleared up a lot of confusion for me.',
      likes: 8,
      time: '2 hours ago',
    },
    {
      id: 3,
      author: 'Emily Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      content: 'Great explanation! One thing to add: make sure you understand the async/await pattern before moving on.',
      likes: 22,
      time: '3 hours ago',
    },
    {
      id: 4,
      author: 'Michael Brown',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      content: 'This is exactly what I needed. The instructor also mentioned this in the Q&A session.',
      likes: 12,
      time: '5 hours ago',
    },
  ];

  // Thread View - Show when a post's replies are clicked
  if (selectedThread !== null && selectedCommunity !== null) {
    const community = communities.find(c => c.id === selectedCommunity);
    if (!community) return null;

    const posts = [
      {
        id: 1,
        title: 'Best practices for this module?',
        author: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1758270704025-0e1a1793e1ca?w=100',
        content: 'I\'ve been working through Module 5 and wanted to share some best practices I\'ve learned. First, always validate your inputs. Second, use error handling properly. Third, write clean, readable code with proper comments. What do you all think?',
        likes: 45,
        replies: 12,
        time: '2 hours ago',
      },
      {
        id: 2,
        title: 'Help with assignment 3',
        author: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1617153817979-283ffdcd52f5?w=100',
        content: 'I\'m stuck on assignment 3, specifically the part about implementing the authentication system. Has anyone successfully completed this? Any tips would be greatly appreciated!',
        likes: 32,
        replies: 8,
        time: '5 hours ago',
      },
      {
        id: 3,
        title: 'Great course! Here are my notes',
        author: 'Mike Johnson',
        avatar: 'https://images.unsplash.com/photo-1646153114001-495dfb56506d?w=100',
        content: 'Just finished the entire course and wanted to share my comprehensive notes with everyone. This course has been amazing and I\'ve learned so much. Feel free to use these as a reference!',
        likes: 78,
        replies: 24,
        time: '1 day ago',
      },
    ];

    const currentPost = posts.find(p => p.id === selectedThread);
    if (!currentPost) return null;

    const isPostHidden = hiddenPosts.includes(currentPost.id);

    return (
      <motion.div 
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex">
          {/* Sidebar - Always visible */}
          <Sidebar
            userRole={userRole === 'guest' ? 'student' : (userRole as 'student' | 'instructor' | 'admin')}
            navigate={navigate}
            logout={logout}
            menuItems={menuItems}
            activePage={selectedCommunity !== null || selectedThread !== null ? 'admin-communities' : 'community'}
          />

          {/* Main Content - Thread View */}
          <div className="flex-1">
            <header className="bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedThread(null)}
                    className="mb-2"
                  >
                    ← Back to {community.courseName}
                  </Button>
                  <h1 className="text-2xl">Discussion Thread</h1>
                  <p className="text-gray-600">{community.topic} Community</p>
                </div>
                <div className="flex items-center gap-4">
                  {userRole === 'admin' && (
                    <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-3 py-1.5">
                      <Shield className="h-4 w-4 mr-1" />
                      Moderation Mode: ON
                    </Badge>
                  )}
                  <HeaderIcons
                    navigate={navigate}
                    logout={logout}
                    userRole={userRole === 'guest' ? 'student' : (userRole as 'student' | 'instructor' | 'admin')}
                  />

                </div>
              </div>
            </header>

            <main className="p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Original Post */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`${isPostHidden ? 'opacity-50 bg-gray-50' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <ImageWithFallback
                          src={currentPost.avatar}
                          alt={currentPost.author}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h2 className="text-2xl mb-2">{currentPost.title}</h2>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                <span>{currentPost.author}</span>
                                <span>•</span>
                                <span>{currentPost.time}</span>
                                {isPostHidden && (
                                  <Badge variant="outline" className="text-xs ml-2">
                                    Hidden by Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {userRole === 'admin' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleHidePost(currentPost.id)}
                                  className={`transition-all duration-300 ${
                                    isPostHidden 
                                      ? 'text-green-600 hover:bg-green-50 border-green-200' 
                                      : 'text-orange-600 hover:bg-orange-50 border-orange-200'
                                  }`}
                                >
                                  <EyeOff className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeletePost(currentPost.id)}
                                  className="text-red-600 hover:bg-red-50 border-red-200 transition-all duration-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 mb-4">{currentPost.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <button className="flex items-center gap-1 hover:text-violet-600 transition-colors">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{currentPost.likes}</span>
                            </button>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{currentPost.replies} replies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Replies Section */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-cyan-600" />
                    Replies ({mockReplies.length})
                  </h3>
                  <div className="space-y-4">
                    {mockReplies.map((reply, index) => {
                      const isReplyHidden = hiddenReplies.includes(reply.id);
                      return (
                        <motion.div
                          key={reply.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <Card className={`${isReplyHidden ? 'opacity-50 bg-gray-50' : 'hover:shadow-md'} transition-all duration-300`}>
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <ImageWithFallback
                                  src={reply.avatar}
                                  alt={reply.author}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span>{reply.author}</span>
                                        <span className="text-sm text-gray-500">• {reply.time}</span>
                                        {isReplyHidden && (
                                          <Badge variant="outline" className="text-xs">
                                            Hidden by Admin
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {userRole === 'admin' && (
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleHideReply(reply.id)}
                                          className={`transition-all duration-300 ${
                                            isReplyHidden 
                                              ? 'text-green-600 hover:bg-green-50 border-green-200' 
                                              : 'text-orange-600 hover:bg-orange-50 border-orange-200'
                                          }`}
                                        >
                                          <EyeOff className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDeleteReply(reply.id)}
                                          className="text-red-600 hover:bg-red-50 border-red-200 transition-all duration-300"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-gray-700 mb-3">{reply.content}</p>
                                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-violet-600 transition-colors">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{reply.likes}</span>
                                  </button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Reply Input */}
                  {(userRole === 'instructor' || userRole === 'student') && (
                    <Card className="mt-6">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <Input placeholder="Write a reply..." className="mb-3" />
                            <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                              Post Reply
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        
        <AIAssistant />
      </motion.div>
    );
  }

  // If a community is selected, show the detail view
  if (selectedCommunity !== null) {
    const community = communities.find(c => c.id === selectedCommunity);
    if (!community) return null;

    return (
      <motion.div 
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex">
          {/* Sidebar - Always visible */}
          <Sidebar
            userRole={userRole === 'guest' ? 'student' : (userRole as 'student' | 'instructor' | 'admin')}
            navigate={navigate}
            logout={logout}
            menuItems={menuItems}
            activePage={selectedCommunity !== null || selectedThread !== null ? 'admin-communities' : 'community'}
          />



          {/* Main Content - Community Detail */}
          <div className="flex-1">
            <header className="bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToCommunities}
                    className="mb-2"
                  >
                    ← Back to Communities
                  </Button>
                  <h1 className="text-2xl">{community.courseName}</h1>
                  <p className="text-gray-600">{community.topic} Community</p>
                </div>
                <div className="flex items-center gap-4">
                  {userRole === 'admin' && (
                    <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-3 py-1.5">
                      <Shield className="h-4 w-4 mr-1" />
                      Moderation Mode: ON
                    </Badge>
                  )}
                  <HeaderIcons
                    navigate={navigate}
                    logout={logout}
                    userRole={userRole === 'guest' ? 'student' : (userRole as 'student' | 'instructor' | 'admin')}
                  />

                  {userRole === 'instructor' && (
                    <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
                      <Plus className="mr-2 h-5 w-5" />
                      New Post
                    </Button>
                  )}
                </div>
              </div>
            </header>

            <main className="p-6">
              {/* Community Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-violet-600" />
                      <div>
                        <div className="text-2xl">{community.members}</div>
                        <div className="text-sm text-gray-600">Members</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-8 w-8 text-cyan-600" />
                      <div>
                        <div className="text-2xl">{community.posts}</div>
                        <div className="text-sm text-gray-600">Posts</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="text-2xl">142</div>
                        <div className="text-sm text-gray-600">Active Today</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Discussion Posts */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        id: 1,
                        title: 'Best practices for this module?',
                        author: 'John Doe',
                        avatar: 'https://images.unsplash.com/photo-1758270704025-0e1a1793e1ca?w=100',
                        likes: 45,
                        replies: 12,
                        time: '2 hours ago',
                      },
                      {
                        id: 2,
                        title: 'Help with assignment 3',
                        author: 'Jane Smith',
                        avatar: 'https://images.unsplash.com/photo-1617153817979-283ffdcd52f5?w=100',
                        likes: 32,
                        replies: 8,
                        time: '5 hours ago',
                      },
                      {
                        id: 3,
                        title: 'Great course! Here are my notes',
                        author: 'Mike Johnson',
                        avatar: 'https://images.unsplash.com/photo-1646153114001-495dfb56506d?w=100',
                        likes: 78,
                        replies: 24,
                        time: '1 day ago',
                      },
                    ].map((post) => {
                      const isHidden = hiddenPosts.includes(post.id);
                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${
                            isHidden ? 'opacity-50 bg-gray-50' : 'hover:border-violet-200'
                          }`}
                          onClick={() => setSelectedThread(post.id)}
                        >
                          <div className="flex gap-4">
                            <ImageWithFallback
                              src={post.avatar}
                              alt={post.author}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex-1">
                                  <h3 className="text-lg">{post.title}</h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <span>{post.author}</span>
                                    <span>•</span>
                                    <span>{post.time}</span>
                                    {isHidden && (
                                      <Badge variant="outline" className="text-xs ml-2">
                                        Hidden by Admin
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {userRole === 'admin' && (
                                  <div className="flex gap-2 ml-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        handleHidePost(post.id);
                                      }}

                                      className={`transition-all duration-300 ${
                                        isHidden 
                                          ? 'text-green-600 hover:bg-green-50 border-green-200' 
                                          : 'text-orange-600 hover:bg-orange-50 border-orange-200'
                                      }`}
                                    >
                                      <EyeOff className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        handleHidePost(post.id);
                                      }}

                                      className="text-red-600 hover:bg-red-50 border-red-200 transition-all duration-300"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <button 
                                  className="flex items-center gap-1 hover:text-violet-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>{post.likes}</span>
                                </button>
                                <button 
                                  className="flex items-center gap-1 hover:text-cyan-600 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedThread(post.id);
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{post.replies} replies</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
        
        <AIAssistant />
      </motion.div>
    );
  }

  // Community list view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - Always visible */}
        <Sidebar
          userRole={userRole === 'guest' ? 'student' : (userRole as 'student' | 'instructor' | 'admin')}
          navigate={navigate}
          logout={logout}
          menuItems={menuItems}
          activePage={selectedCommunity !== null || selectedThread !== null ? 'admin-communities' : 'community'}
        />


        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl">Communities</h1>
                <p className="text-gray-600">Connect with learners in your courses</p>
              </div>
              <HeaderIcons
                navigate={navigate}
                logout={logout}
                userRole={userRole === 'guest' ? 'student' : (userRole as 'student' | 'instructor' | 'admin')}
              />

            </div>
          </header>

          <main className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search communities..." className="pl-10" />
              </div>
            </div>

            {/* Community Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                    onClick={() => setSelectedCommunity(community.id)}
                  >
                    {/* Course Thumbnail */}
                    <div className="relative h-48">
                      <ImageWithFallback
                        src={community.thumbnail}
                        alt={community.courseName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-3 right-3 bg-white text-gray-900">
                        {community.topic}
                      </Badge>
                    </div>

                    {/* Course Info */}
                    <CardContent className="p-4">
                      <h3 className="text-lg mb-3 line-clamp-2">{community.courseName}</h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{community.members} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{community.posts} posts</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300"
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                          setSelectedCommunity(community.id);
                        }}

                      >
                        View Community
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
      
      <AIAssistant />
    </div>
  );
}