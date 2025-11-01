import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Search, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

interface TopNavigationProps {
  isAuthenticated?: boolean;
  onSearchClick?: () => void;
  currentUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
}

export function TopNavigation({ isAuthenticated = false, onSearchClick, currentUser }: TopNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock course data for search
  const allCourses = [
    {
      id: 1,
      title: 'Complete React.js Masterclass',
      instructor: 'Dr. Sarah Wilson',
      category: 'Frontend Development',
      level: 'Intermediate',
      students: 12500,
    },
    {
      id: 2,
      title: 'Python for Data Science',
      instructor: 'Prof. Ahmed Khan',
      category: 'Data Science',
      level: 'Beginner',
      students: 8900,
    },
    {
      id: 3,
      title: 'Machine Learning Fundamentals',
      instructor: 'Dr. Emily Chen',
      category: 'AI & Machine Learning',
      level: 'Advanced',
      students: 5600,
    },
    {
      id: 4,
      title: 'Node.js Backend Development',
      instructor: 'Alex Rodriguez',
      category: 'Backend Development',
      level: 'Intermediate',
      students: 4200,
    },
    {
      id: 5,
      title: 'Web Design Essentials',
      instructor: 'Michael Johnson',
      category: 'Design',
      level: 'Beginner',
      students: 7800,
    },
    {
      id: 6,
      title: 'Advanced JavaScript Patterns',
      instructor: 'Dr. Sarah Wilson',
      category: 'Frontend Development',
      level: 'Advanced',
      students: 3400,
    },
    {
      id: 7,
      title: 'SQL Database Design',
      instructor: 'Prof. Ahmed Khan',
      category: 'Database',
      level: 'Intermediate',
      students: 6200,
    },
    {
      id: 8,
      title: 'Mobile App Development with React Native',
      instructor: 'Lisa Anderson',
      category: 'Mobile Development',
      level: 'Intermediate',
      students: 4800,
    },
  ];

  const searchResults = searchQuery.trim()
    ? allCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSelect = (courseId: number) => {
    navigate(`/courses/${courseId}`);
    setShowSearch(false);
    setSearchQuery('');
  };

  // Handle "Who We Are" link - scroll on home page, navigate to home on other pages
  const handleWhoWeAreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      // Already on home page, just scroll
      e.preventDefault();
      const element = document.getElementById('who-we-are');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page with hash
      navigate('/#who-we-are');
    }
  };

  // Handle "Explore Courses" link - scroll on home page if it exists, otherwise navigate to browse
  const handleExploreCoursesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('explore-courses');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - TechHub Logo & Navigation Links */}
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 mr-2"
              >
                <GraduationCap className="w-6 h-6 text-blue-600" />
                <span className="text-xl text-gray-900">TechHub</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <a
                href="/#who-we-are"
                onClick={handleWhoWeAreClick}
                className="text-sm hover:text-blue-600 transition-colors"
              >
                Who We Are
              </a>
              <Link
                to="/contact"
                className="text-sm hover:text-blue-600 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/partners"
                className="text-sm hover:text-blue-600 transition-colors"
              >
                Our Partners
              </Link>
              <Link
                to="/browse"
                onClick={handleExploreCoursesClick}
                className="text-sm hover:text-blue-600 transition-colors"
              >
                Explore Courses
              </Link>
              <Link
                to="/plans"
                className="text-sm hover:text-blue-600 transition-colors"
              >
                Plans
              </Link>
            </div>

            {/* Right side - Search and Auth */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10 pr-4"
                  onClick={onSearchClick || (() => setShowSearch(true))}
                  readOnly
                />
              </div>

              {/* Auth Buttons or User Info */}
              {!isAuthenticated ? (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/signin">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              ) : currentUser && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Welcome, {currentUser.name.split(' ')[0]}</span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Dialog - only show if not using custom search */}
      {!onSearchClick && (
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0" aria-describedby={undefined}>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-3">
              <Search className="w-5 h-5" />
              Search Courses
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Type to search courses, topics, or instructors..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: 'calc(80vh - 180px)' }}>
            {searchQuery.trim() === '' ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Start typing to search for courses
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''}
                </p>
                {searchResults.map((course) => (
                  <Card
                    key={course.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSearchSelect(course.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{course.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {course.instructor}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {course.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {course.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {course.students.toLocaleString()} students
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No courses found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try different keywords or browse all courses
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      )}
    </>
  );
}
