import { useEffect, useState } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ThumbsUp, MessageCircle, Search, Plus, TrendingUp, Users, Code2, Sparkles, LayoutDashboard, BookOpen, FileText, Award, Map, Code, Bell, User, Settings, LogOut, BarChart3, Shield, EyeOff, Trash2, Menu } from 'lucide-react';
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
import { COURSE_CATEGORIES } from '../constants/courseCategories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNavigate } from "react-router-dom";
import { notifyUpdate } from '../utils/notifications';

interface CommunityProps {
  logout: () => void;
  userRole: UserRole;
  initialCommunityId?: number;
}



export default function Community({ logout, userRole, initialCommunityId }: CommunityProps) {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [creatingPost, setCreatingPost] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(initialCommunityId || null);
  const [hiddenPosts, setHiddenPosts] = useState<number[]>([]);
  const [selectedThread, setSelectedThread] = useState<number | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [newReplyContent, setNewReplyContent] = useState("");
  const [hiddenReplies, setHiddenReplies] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const [reportType, setReportType] = useState<"post" | "reply" | null>(null);
  const [postFilter, setPostFilter] = useState<"all" | "mine">("all");
  const [reportCategory, setReportCategory] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUserId(Number(parsed.id));
    }

  }, []);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await fetch("/api/communities", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }

        });
        console.log("TOKEN 👉", localStorage.getItem("accessToken"));

        const data = await res.json();
        console.log("Backend communities:", data);
        setCommunities(
          data.map((item: any) => ({
            id: item.id,
            courseName: item.title,
            topic: COURSE_CATEGORIES[item.category] || item.category,
            members: item.members_count,
            posts: item.posts_count,
            thumbnail: item.thumbnail
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    if (!selectedCommunity) return;

    const fetchPosts = async () => {
      try {
        setPostsLoading(true);

        const res = await fetch(
          `/api/communities/${selectedCommunity}/posts`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );

        const data = await res.json();
        console.log("Posts from backend:", data);

        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCommunity]);

  useEffect(() => {
    if (!selectedThread) return;

    const fetchReplies = async () => {
      try {
        setRepliesLoading(true);

        const res = await fetch(
          `/api/communities/posts/${selectedThread}/replies`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );

        const data = await res.json();
        console.log("Replies:", data);
        setReplies(data);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load replies");
      } finally {
        setRepliesLoading(false);
      }
    };

    fetchReplies();
  }, [selectedThread]);

  const handleHidePost = async (postId: number) => {
    try {
      const res = await fetch(
        `/api/posts/${postId}/toggle-hide`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // 👇 تحديث ال UI من الباك
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, is_hidden: data.post.is_hidden }
            : post
        )
      );

      toast.success(data.message);

    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle hide");
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const res = await fetch(
        `/api/communities/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setPosts(prev => prev.filter(post => post.id !== postId));

      toast.success("Post deleted successfully");
      notifyUpdate();

    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    }
  };

  const handleUpdatePost = async (postId: number) => {
    try {
      const res = await fetch(
        `/api/communities/posts/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          },
          body: JSON.stringify({
            content: editContent
          })
        }
      );

      const data = await res.json();

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, content: data.content }
            : post
        )
      );

      setEditingPostId(null);
      setEditContent("");
      toast.success("Post updated successfully");
      notifyUpdate();

    } catch (err) {
      console.error(err);
      toast.error("Failed to update post");
    }
  };

  const handleReportPost = (postId: number) => {
    setReportType("post");
    setReportPostId(postId);
    setIsReportOpen(true);
  };


  const submitReport = async () => {
    if (!reportCategory || !reportReason.trim() || !reportPostId || !reportType) {
      toast.error("Please complete all fields");
      return;
    }

    try {
      const url =
        reportType === "post"
          ? `/api/communities/posts/${reportPostId}/report`
          : `/api/communities/replies/${reportPostId}/report`;

      // 👇 خزني القيم في variables قبل fetch
      const payload = {
        category: reportCategory,
        reason: reportReason.trim()
      };

      console.log("SENDING:", payload); // 🔥 مهم

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Report submitted successfully");

      setIsReportOpen(false);
      setReportReason("");
      setReportCategory(""); // 👈 كنتي ناسية دي
      setReportPostId(null);
      setReportType(null);

    } catch (err: any) {
      toast.error(err.message);
    }
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

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      setCreatingPost(true);

      const res = await fetch(
        `/api/communities/${selectedCommunity}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          },
          body: JSON.stringify({
            content: newPostContent
          })
        }
      );

      const data = await res.json();

      setPosts(prev => [data, ...prev]);

      setNewPostContent("");
      toast.success("Post created successfully");
      notifyUpdate();

    } catch (err) {
      console.error(err);
      toast.error("Failed to create post");
    } finally {
      setCreatingPost(false);
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      const res = await fetch(
        `/api/communities/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      const data = await res.json();

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
              ...post,
              likes_count: data.liked
                ? post.likes_count + 1
                : post.likes_count - 1,
              is_liked_by_me: data.liked
            }
            : post
        )
      );

    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle like");
    }
  };

  const handleToggleReplyLike = async (replyId: number) => {
    try {
      const res = await fetch(
        `/api/communities/replies/${replyId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      const data = await res.json();

      setReplies(prev =>
        prev.map(reply =>
          reply.id === replyId
            ? {
              ...reply,
              likes_count: data.liked
                ? reply.likes_count + 1
                : reply.likes_count - 1,
              is_liked_by_me: data.liked
            }
            : reply
        )
      );

    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle like");
    }
  };

  const handleCreateReply = async () => {
    if (!newReplyContent.trim()) return;

    try {
      const res = await fetch(
        `/api/communities/posts/${selectedThread}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          },
          body: JSON.stringify({
            content: newReplyContent
          })
        }
      );

      const data = await res.json();

      setReplies(prev => [...prev, data]);

      setPosts(prev =>
        prev.map(post =>
          post.id === selectedThread
            ? { ...post, replies_count: post.replies_count + 1 }
            : post
        )
      );

      setNewReplyContent("");
      toast.success("Reply posted successfully");
      notifyUpdate();

    } catch (err) {
      console.error(err);
      toast.error("Failed to post reply");
    }
  };

  const handleUpdateReply = async (replyId: number) => {
    try {
      const res = await fetch(
        `/api/communities/replies/${replyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          },
          body: JSON.stringify({
            content: editReplyContent
          })
        }
      );

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();

      setReplies(prev =>
        prev.map(reply =>
          reply.id === replyId
            ? { ...reply, content: data.content }
            : reply
        )
      );

      setEditingReplyId(null);
      setEditReplyContent("");
      toast.success("Reply updated successfully");
      notifyUpdate();

    } catch (err) {
      console.error(err);
      toast.error("Failed to update reply");
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    try {
      const res = await fetch(
        `/api/communities/replies/${replyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setReplies(prev => prev.filter(reply => reply.id !== replyId));

      setPosts(prev =>
        prev.map(post =>
          post.id === selectedThread
            ? { ...post, replies_count: post.replies_count - 1 }
            : post
        )
      );

      toast.success("Reply deleted successfully");
      notifyUpdate();

    } catch (err) {
      console.error(err);
      toast.error("Failed to delete reply");
    }
  };

  const handleReportReply = (replyId: number) => {
    setReportType("reply");
    setReportPostId(replyId);
    setIsReportOpen(true);
  };

  const handleBackToCommunities = () => {
    if (userRole === 'admin') {
      // Return to admin community management page
      navigate('/admin/communities');
    } else {
      // Return to community list view
      setSelectedCommunity(null);
    }
  };

  const filteredPosts = posts.filter((post) => {

    if (userRole !== "admin" && post.is_hidden) {
      return false;
    }

    if (postFilter === "mine") {
      return post.user_id === currentUserId;
    }

    return true;
  });

  // Filter communities based on search query
  const filteredCommunities = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return communities;
    }

    const query = searchQuery.toLowerCase();
    return communities.filter((community) => {
      return (
        community.courseName.toLowerCase().includes(query) ||
        community.topic.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, communities]);

  const menuItems = userRole === 'admin'
    ? [
      { icon: LayoutDashboard, label: 'Dashboard', page: '/admin/dashboard' },
      { icon: Users, label: 'Users', page: '/admin/users' },
      { icon: BookOpen, label: 'Courses', page: '/admin/courses' },
      { icon: MessageSquare, label: 'Communities', page: '/admin/communities', active: selectedCommunity !== null || selectedThread !== null },
      { icon: FileText, label: 'Reports', page: '/admin/reports' },
      { icon: Bell, label: 'Notifications', page: '/admin/notifications' },
      { icon: User, label: 'Profile', page: '/admin/profile' },
      { icon: Settings, label: 'Settings', page: '/admin/settings' },
    ]
    : userRole === 'instructor'
      ? [
        { icon: LayoutDashboard, label: 'Dashboard', page: '/instructor/dashboard' },
        { icon: BookOpen, label: 'My Courses', page: '/instructor/courses' },
        { icon: BarChart3, label: 'Assignments', page: '/instructor/assignments' },
        { icon: Users, label: 'Community', page: '/community' },
        { icon: Bell, label: 'Notifications', page: '/instructor/notifications' },
        { icon: User, label: 'Profile', page: '/instructor/profile' },
        { icon: Settings, label: 'Settings', page: '/instructor/settings' },
        { icon: MessageSquare, label: 'Contact Us', page: '/instructor/contact' },
      ]
      : [
        { icon: LayoutDashboard, label: 'Dashboard', page: '/student/dashboard' },
        { icon: BookOpen, label: 'Courses', page: '/student/courses' },
        { icon: FileText, label: 'Assignments', page: '/student/assignments' },
        { icon: Award, label: 'Certificates', page: '/student/certificates' },
        { icon: Users, label: 'Community', page: '/community', active: true },
        { icon: Map, label: 'Roadmaps', page: '/student/roadmaps' },
        { icon: Code, label: 'Compiler', page: '/student/compiler' },
        { icon: Bell, label: 'Notifications', page: '/student/notifications' },
        { icon: User, label: 'Profile', page: '/student/profile' },
        { icon: Settings, label: 'Settings', page: '/student/settings' },
        { icon: MessageSquare, label: 'Contact Us', page: '/student/contact' },
      ];

  // Thread View - Show when a post's replies are clicked
  if (selectedThread !== null && selectedCommunity !== null) {
    const community = communities.find(c => c.id === selectedCommunity);
    if (!community) return null;

    const currentPost = posts.find(p => p.id === selectedThread);
    if (!currentPost) return null;

    const isPostHidden = currentPost.is_hidden;



    return (
      <motion.div
        className="min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Always visible */}
          <Sidebar
            userRole={userRole}
            logout={logout}
            menuItems={menuItems}
            activePage={selectedCommunity !== null || selectedThread !== null ? '/admin/communities' : '/community'}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
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

                  <HeaderIcons logout={logout} userRole={userRole} />
                </div>
              </div>
            </header>

            <main className="p-4 md:p-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
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
                          src={currentPost.profile_image}
                          alt={currentPost.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                <span className="font-semibold text-gray-900 text-base leading-none">
                                  {currentPost.full_name}
                                </span>

                                <span>•</span>

                                <span>
                                  {new Date(currentPost.created_at).toLocaleString()}
                                </span>

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
                                  className={`transition-all duration-300 ${isPostHidden
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
                            <button
                              className={`flex items-center gap-1 transition-colors ${currentPost.is_liked_by_me
                                ? "text-violet-600"
                                : "hover:text-violet-600"
                                }`}
                              onClick={() => handleToggleLike(currentPost.id)}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>{currentPost.likes_count}</span>
                            </button>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{currentPost.replies_count} replies</span>
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
                    Replies ({replies.length})
                  </h3>
                  <div className="space-y-4">
                    {replies.map((reply, index) => {
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
                                  src={reply.profile_image}
                                  alt={reply.full_name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span>{reply.full_name}</span>
                                        <span className="text-sm text-gray-500">• {new Date(reply.created_at).toLocaleString()}</span>
                                        {isReplyHidden && (
                                          <Badge variant="outline" className="text-xs">
                                            Hidden by Admin
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {userRole === 'admin' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleHideReply(reply.id)}
                                        className={`transition-all duration-300 ${isReplyHidden
                                          ? 'text-green-600 hover:bg-green-50 border-green-200'
                                          : 'text-orange-600 hover:bg-orange-50 border-orange-200'
                                          }`}
                                      >
                                        <EyeOff className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {(userRole === 'admin' || reply.user_id === currentUserId) && (
                                      <div className="flex gap-2">

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingReplyId(reply.id);
                                            setEditReplyContent(reply.content);
                                          }}
                                        >
                                          Edit
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
                                    {reply.user_id !== currentUserId && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReportReply(reply.id)}
                                      >
                                        Report
                                      </Button>
                                    )}
                                  </div>
                                  {editingReplyId === reply.id ? (
                                    <div className="flex gap-2">
                                      <input
                                        value={editReplyContent}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setEditReplyContent(e.target.value)}
                                        className="border p-2 rounded w-full"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateReply(reply.id);
                                        }}
                                        className="bg-gradient-to-r from-violet-600 to-cyan-500"
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  ) : (
                                    <p className="text-gray-700 mb-3">{reply.content}</p>
                                  )}
                                  <button
                                    className={`flex items-center gap-1 text-sm transition-colors ${reply.is_liked_by_me
                                      ? "text-violet-600"
                                      : "text-gray-600 hover:text-violet-600"
                                      }`}
                                    onClick={() => handleToggleReplyLike(reply.id)}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{reply.likes_count}</span>
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
                            <Input
                              value={newReplyContent}
                              onChange={(e) => setNewReplyContent(e.target.value)}
                              placeholder="Write a reply..."
                              className="mb-3"
                            />
                            <Button onClick={handleCreateReply} className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300">
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

        {isReportOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                {reportType === "reply" ? "Report Reply" : "Report Post"}
              </h2>

              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Category <span className="text-red-500">*</span>
                </label>

                <Select value={reportCategory} onValueChange={setReportCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Spam">Spam</SelectItem>
                    <SelectItem value="Harassment">Harassment</SelectItem>
                    <SelectItem value="Inappropriate">Inappropriate Content</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={
                  reportType === "reply"
                    ? "Why are you reporting this reply?"
                    : "Why are you reporting this post?"
                }
                className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400"
                rows={4}
              />

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReportOpen(false);
                    setReportReason("");
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={submitReport}
                  className="bg-gradient-to-r from-violet-600 to-cyan-500"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}

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
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Always visible */}
          <Sidebar
            userRole={userRole}
            logout={logout}
            menuItems={menuItems}
            activePage={selectedCommunity !== null || selectedThread !== null ? '/admin/communities' : '/community'}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />

          {/* Main Content - Community Detail */}
          <div className="flex-1 h-screen overflow-y-auto">
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
                  <HeaderIcons logout={logout} userRole={userRole} />
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
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-violet-600" />
                      </div>

                      <div className="flex-1">
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Write a post..."
                          className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                          rows={3}
                        />

                        <div className="flex justify-end mt-3">
                          <Button
                            onClick={handleCreatePost}
                            disabled={creatingPost}
                            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                          >
                            {creatingPost ? "Posting..." : "Post"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>



              {/* Discussion Posts */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-2 mb-4">
                    <Button
                      size="sm"
                      onClick={() => setPostFilter("all")}
                      className={`${postFilter === "all"
                        ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      All Posts
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setPostFilter("mine")}
                      className={`${postFilter === "mine"
                        ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      My Posts
                    </Button>
                  </div>

                  <div className="space-y-4">

                    {filteredPosts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />

                        <h3 className="text-lg font-semibold text-gray-600">
                          {postFilter === "mine"
                            ? "You haven't posted anything yet"
                            : "No posts available"}
                        </h3>

                        <p className="text-sm text-gray-400 mt-2">
                          {postFilter === "mine"
                            ? "Start sharing your thoughts with the community!"
                            : "Be the first to start a discussion."}
                        </p>
                      </div>
                    ) : (
                      filteredPosts.map((post) => {
                        console.log("Post user:", post.user_id);
                        console.log("Current user:", currentUserId);
                        console.log("Equal?", post.user_id === currentUserId);
                        const isHidden = post.is_hidden;

                        return (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${isHidden
                              ? "opacity-50 bg-gray-50"
                              : "hover:border-violet-200"
                              }`}
                            onClick={() => setSelectedThread(post.id)}
                          >
                            <div className="flex gap-4">
                              <ImageWithFallback
                                src={post.profile_image}
                                alt={post.full_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />

                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex-1">
                                    {editingPostId === post.id ? (
                                      <div className="flex gap-2">
                                        <input
                                          value={editContent}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) => setEditContent(e.target.value)}
                                          className="border p-2 rounded w-full"
                                        />
                                        <Button
                                          className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUpdatePost(post.id);
                                          }}
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    ) : (
                                      <h3 className="text-lg">{post.content}</h3>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                      <span>{post.full_name}</span>
                                      <span>•</span>
                                      <span>
                                        {new Date(post.created_at).toLocaleString()}
                                      </span>

                                      {isHidden && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs ml-2"
                                        >
                                          Hidden by Admin
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {userRole === "admin" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleHidePost(post.id);
                                      }}
                                    >
                                      <EyeOff className="h-4 w-4" />
                                    </Button>
                                  )}

                                  {(userRole === "admin" ||
                                    post.user_id === currentUserId) && (
                                      <div className="flex gap-2 ml-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingPostId(post.id);
                                            setEditContent(post.content);
                                          }}
                                        >
                                          Edit
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePost(post.id);
                                          }}
                                          className="text-red-600 hover:bg-red-50 border-red-200 transition-all duration-300"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}

                                  {post.user_id !== Number(currentUserId) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReportPost(post.id);
                                      }}
                                    >
                                      Report
                                    </Button>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <button
                                    className={`flex items-center gap-1 transition-colors ${post.is_liked_by_me
                                      ? "text-violet-600"
                                      : "hover:text-violet-600"
                                      }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleLike(post.id);
                                    }}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{post.likes_count}</span>
                                  </button>

                                  <button
                                    className="flex items-center gap-1 hover:text-cyan-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedThread(post.id);
                                    }}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>{post.replies_count} replies</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>

        {isReportOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                Report Post
              </h2>

              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Category <span className="text-red-500">*</span>
                </label>

                <Select value={reportCategory} onValueChange={setReportCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Spam">Spam</SelectItem>
                    <SelectItem value="Harassment">Harassment</SelectItem>
                    <SelectItem value="Inappropriate">Inappropriate Content</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this post?"
                className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400"
                rows={4}
              />

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReportOpen(false);
                    setReportReason("");
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={submitReport}
                  className="bg-gradient-to-r from-violet-600 to-cyan-500"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}

        <AIAssistant />
      </motion.div>
    );
  }

  // Community list view
  return (
    <div className="h-screen bg-gray-50 relative overflow-hidden">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Always visible */}
        <Sidebar
          userRole={userRole}
          logout={logout}
          menuItems={menuItems}
          activePage={selectedCommunity !== null || selectedThread !== null ? '/admin/communities' : '/community'}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 w-full overflow-hidden h-screen overflow-y-auto scrollbar-hide">
          <header className="bg-white border-b px-4 md:px-6 py-4 sticky top-0 z-30">
            {/* Mobile: Two-row layout */}
            <div className="lg:hidden">
              <div className="flex items-start justify-between mb-4 gap-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => setIsMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div className="flex-1 h-screen overflow-y-auto scrollbar-hide">
                  <h1 className="text-xl">Communities</h1>
                  <p className="text-gray-600 text-sm">Connect with learners in your courses</p>
                </div>
                <HeaderIcons logout={logout} userRole={userRole} />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-violet-400 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Desktop: Single-row layout with search in the middle */}
            <div className="hidden lg:flex items-center justify-between gap-6">
              <div className="flex-shrink-0">
                <h1 className="text-2xl">Communities</h1>
                <p className="text-gray-600">Connect with learners in your courses</p>
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-violet-400 focus:outline-none transition-all duration-200"
                />
              </div>
              <div className="flex-shrink-0">
                <HeaderIcons logout={logout} userRole={userRole} />
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6">
            {/* Community Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredCommunities.map((community, index) => (
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
                        onClick={(e) => {
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

      {isReportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Report Post
            </h2>

            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Category <span className="text-red-500">*</span>
              </label>

              <Select value={reportCategory} onValueChange={setReportCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Spam">Spam</SelectItem>
                  <SelectItem value="Harassment">Harassment</SelectItem>
                  <SelectItem value="Inappropriate">Inappropriate Content</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Why are you reporting this post?"
              className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400"
              rows={4}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReportOpen(false);
                  setReportReason("");
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={submitReport}
                className="bg-gradient-to-r from-violet-600 to-cyan-500"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      <AIAssistant />
    </div>
  );
}