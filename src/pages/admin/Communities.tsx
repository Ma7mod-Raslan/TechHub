import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, BookOpen, MessageSquare, FileText, Bell, User, Settings, LogOut, Search, Eye, Trash2, X, Heart, Shield, ArrowRight, EyeOff, Menu } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Code2 } from 'lucide-react';
import HeaderIcons from '../../components/HeaderIcons';
import AIAssistant from '../../components/AIAssistant';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { COURSE_CATEGORIES } from "../../constants/courseCategories";
import { useNavigate } from 'react-router-dom';

interface CommunitiesProps {
  logout: () => void;
  userRole: string;
}

interface Community {
  id: number;
  course_name: string;
  instructor_name: string;
  category: string;
  members_count: number;
  posts_count: number;
  is_active: boolean;
}

interface Post {
  id: number;
  author: string;
  content: string;
  likes: number;
  comments: number;
  date: string;
  hidden: boolean;
}

interface Reply {
  id: number;
  content: string;
  sender_name: string;
  created_at: string;
  status: string;
}


export default function AdminCommunities({ logout }: CommunitiesProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);


  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: '/admin/dashboard' },
    { icon: Users, label: 'Users', page: '/admin/users' },
    { icon: BookOpen, label: 'Courses', page: '/admin/courses' },
    { icon: MessageSquare, label: 'Communities', page: '/admin/communities', active: true },
    { icon: FileText, label: 'Reports', page: '/admin/reports' },
    { icon: Bell, label: 'Notifications', page: '/admin/notifications' },
    { icon: User, label: 'Profile', page: '/admin/profile' },
    { icon: Settings, label: 'Settings', page: '/admin/settings' },
  ];

  const handleViewComments = async (postId: number) => {
    try {
      const res = await fetch(
        `http://localhost:5000/admin/posts/${postId}/replies`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      if (!res.ok) throw new Error("Failed to fetch replies");

      const data = await res.json();

      setSelectedPostId(postId);
      setReplies(
        data.map((r: any) => ({
          id: r.id,
          content: r.content,
          sender_name: r.sender_name,
          created_at: r.created_at,
          status: r.status
        }))
      );
      setIsCommentsOpen(true); // 🔥 فتح المودال

    } catch (err) {
      console.error(err);
    }
  };
  const handleViewCommunity = async (community: any) => {
    try {
      const res = await fetch(
        `http://localhost:5000/admin/communities/${community.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch community details");
      }

      const data = await res.json();

      setSelectedCommunity(data);

      setPosts(
        data.recent_posts.map((p: any) => ({
          id: p.id,
          author: p.sender_name,
          content: p.content,
          likes: p.total_likes,
          comments: p.total_replies,
          date: p.time,
          hidden: p.is_hidden
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    try {
      const res = await fetch(
        `http://localhost:5000/admin/replies/${replyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );


      if (!res.ok) throw new Error("Failed to delete reply");

      // remove from UI
      setReplies(prev => prev.filter(r => r.id !== replyId));


    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleReply = async (replyId: number) => {
    try {
      const res = await fetch(
        `http://localhost:5000/admin/replies/${replyId}/toggle-hide`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      if (!res.ok) throw new Error("Failed to toggle reply");

      setReplies(prev =>
        prev.map(r =>
          r.id === replyId
            ? { ...r, status: r.status === "visible" ? "hidden" : "visible" }
            : r
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  const handleHidePost = async (postId: number) => {
    try {
      const res = await fetch(
        `http://localhost:5000/admin/posts/${postId}/toggle-hide`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to toggle post visibility");
      }

      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, hidden: !p.hidden } : p
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const res = await fetch(
        `http://localhost:5000/admin/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts(prev => prev.filter(p => p.id !== postId));

    } catch (err) {
      console.error(err);
    }
  };

  const handleGoToCommunity = () => {
    if (!selectedCommunity) return;

    // Navigate to the actual community page with the specific community ID
    // The community page will detect admin role and show moderation controls
    navigate('/community', { state: { communityId: selectedCommunity.id } });
    toast.info('Moderation Mode: ON - You have admin privileges');
  };


  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/communities", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });

        const data = await res.json();
        setCommunities(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    if (isCommentsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isCommentsOpen]);

  const filterCommunities = (): Community[] =>
    communities.filter((community) =>
      community.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h1 className="text-2xl">Community Management</h1>
                <p className="text-gray-600">Monitor all course communities on the platform</p>
              </div>
              <HeaderIcons logout={logout} userRole="admin" currentPage="admin-communities" />
            </div>
          </header>

          <main className="p-6">
            {!selectedCommunity ? (
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search communities..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course Name</TableHead>
                          <TableHead>Instructor</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Members</TableHead>
                          <TableHead>Posts</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterCommunities().map((community) => (
                          <TableRow key={community.id}>
                            <TableCell>{community.course_name}</TableCell>
                            <TableCell className="text-gray-600">{community.instructor_name}</TableCell>
                            <TableCell>
                              <Badge className="bg-violet-100 text-violet-700">{COURSE_CATEGORIES[community.category] || community.category}</Badge>
                            </TableCell>
                            <TableCell>{community.members_count.toLocaleString()}</TableCell>
                            <TableCell>{community.posts_count}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  community.is_active
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-gray-100 text-gray-700"
                                }
                              >
                                {community.is_active ? "Active" : "Suspended"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewCommunity(community)}
                                className="hover:bg-gradient-to-r hover:from-violet-600 hover:to-cyan-500 hover:text-white transition-all duration-300"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-6xl mx-auto"
                >
                  <Card className="shadow-xl">
                    <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-cyan-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">Community Overview</CardTitle>
                          <p className="text-gray-600">{selectedCommunity.courseName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin View
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedCommunity(null)}
                            className="hover:bg-white/50"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                      <div className="space-y-6">
                        {/* Community Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                              <CardContent className="pt-6 text-center">
                                <Users className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                                <div className="text-3xl mb-1">{selectedCommunity.members.toLocaleString()}</div>
                                <div className="text-sm text-gray-600">Members</div>
                              </CardContent>
                            </Card>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                              <CardContent className="pt-6 text-center">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-cyan-600" />
                                <div className="text-3xl mb-1">{selectedCommunity.total_posts}</div>
                                <div className="text-sm text-gray-600">Total Posts</div>
                              </CardContent>
                            </Card>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                              <CardContent className="pt-6 text-center">
                                <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                <div className="text-3xl mb-1">Active</div>
                                <div className="text-sm text-gray-600">Status</div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>

                        <Separator />

                        {/* Recent Posts */}
                        <div>
                          <h3 className="mb-4 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-violet-600" />
                            Recent Posts
                          </h3>
                          <div className="space-y-4">
                            {posts.map((post, index) => (
                              <motion.div
                                key={post.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card
                                  className={`transition-all duration-300 hover:shadow-md ${post.hidden ? 'opacity-50 bg-gray-50' : 'hover:border-violet-200'
                                    }`}
                                >
                                  <CardContent className="pt-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className="bg-gradient-to-br from-violet-100 to-cyan-100 rounded-full p-2">
                                          <User className="h-5 w-5 text-violet-600" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span>{post.author}</span>
                                            {post.hidden && (
                                              <Badge variant="outline" className="text-xs">
                                                Hidden by Admin
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {new Date(post.date).toLocaleString("en-US", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit"
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleHidePost(post.id)}
                                          className={`transition-all duration-300 ${post.hidden
                                            ? 'text-green-600 hover:bg-green-50 border-green-200'
                                            : 'text-orange-600 hover:bg-orange-50 border-orange-200'
                                            }`}
                                        >
                                          {post.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDeletePost(post.id)}
                                          className="text-red-600 hover:bg-red-50 border-red-200 transition-all duration-300"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-gray-700 mb-3 ml-11">{post.content}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 ml-11">
                                      <div className="flex items-center gap-1.5">
                                        <Heart className="h-4 w-4 text-red-500" />
                                        <span>{post.likes} likes</span>
                                      </div>
                                      <div
                                        className="flex items-center gap-1.5 cursor-pointer"
                                        onClick={() => handleViewComments(post.id)}
                                      >
                                        <MessageSquare className="h-4 w-4 text-cyan-500" />
                                        <span>{post.comments} comments</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <div className="border-t p-6 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          View the full community with live interactions and moderation tools
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>

      </div>
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-md max-h-[80vh] rounded-2xl shadow-2xl flex flex-col my-10"
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-violet-50 to-cyan-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-violet-600" />
                  Comments
                </h2>

                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 transition"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {replies.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center">
                    No comments yet
                  </p>
                ) : (
                  replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`flex gap-3 p-3 rounded-xl transition ${reply.status === "hidden"
                        ? "opacity-50 bg-gray-50"
                        : reply.status === "deleted"
                          ? "opacity-40 bg-red-50 border border-red-200"
                          : "hover:bg-gray-50"
                        }`}
                    >
                      {/* Avatar */}
                      <div className="bg-gradient-to-br from-violet-100 to-cyan-100 rounded-full p-2 h-fit">
                        <User className="h-4 w-4 text-violet-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {/* Top Row */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium flex items-center gap-2">
                            {reply.sender_name}

                            {reply.status === "deleted" && (
                              <span className="text-xs px-2 py-0.5 border rounded-full text-red-600 border-red-300">
                                Deleted
                              </span>
                            )}
                          </span>

                          {/* Actions */}
                          {reply.status !== "deleted" && (
                            <div className="flex gap-2">

                              {/* Hide / Unhide */}
                              <button
                                onClick={() => handleToggleReply(reply.id)}
                                className={`p-1 rounded transition ${reply.status === "hidden"
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-orange-600 hover:bg-orange-50"
                                  }`}
                              >
                                {reply.status === "hidden" ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteReply(reply.id)}
                                className="p-1 rounded text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>
                          )}
                        </div>

                        {/* Date */}
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(reply.created_at).toLocaleString()}
                        </div>

                        {/* Content */}
                        <p className={`text-sm mt-1 ${reply.status === "deleted"
                          ? "text-gray-400 italic line-through"
                          : "text-gray-700"
                          }`}>
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIAssistant />

    </div>

  );
}