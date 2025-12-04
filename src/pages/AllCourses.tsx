import { useState } from 'react';
import { Star, Users, Clock, Filter, Grid, List, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/Assets/ImageWithFallback';

interface AllCoursesProps {
  navigate: (page: string) => void;
  isLoggedIn?: boolean;
  userRole?: 'student' | 'instructor' | 'admin' | 'guest';
  logout?: () => void;
}

const categories = ['All Courses', 'Web Development', 'Data Science', 'Mobile Development', 'Machine Learning', 'Cloud Computing', 'Cybersecurity'];

const allCourses = [
  {
    id: 1,
    title: 'Complete Web Development Bootcamp',
    instructor: 'Sarah Johnson',
    rating: 4.9,
    students: 12500,
    duration: '42 hours',
    image: 'https://images.unsplash.com/photo-1593720213681-e9a8778330a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc2NDA5ODU0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Web Development',
    level: 'Beginner',
    bestseller: true,
  },
  {
    id: 2,
    title: 'Data Science & Machine Learning A-Z',
    instructor: 'Dr. Michael Chen',
    rating: 4.8,
    students: 8900,
    duration: '38 hours',
    image: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NjQxNjc0NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Data Science',
    level: 'Intermediate',
    bestseller: true,
  },
  {
    id: 3,
    title: 'iOS & Android App Development',
    instructor: 'Emily Rodriguez',
    rating: 4.7,
    students: 6200,
    duration: '35 hours',
    image: 'https://images.unsplash.com/photo-1633250391894-397930e3f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NjQxNjMxNDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Mobile Development',
    level: 'Intermediate',
    bestseller: false,
  },
  {
    id: 4,
    title: 'Advanced Machine Learning & AI',
    instructor: 'Dr. James Wilson',
    rating: 4.9,
    students: 5400,
    duration: '45 hours',
    image: 'https://images.unsplash.com/photo-1526378800651-c32d170fe6f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWNoaW5lJTIwbGVhcm5pbmclMjBBSXxlbnwxfHx8fDE3NjQxNDgzNjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Machine Learning',
    level: 'Advanced',
    bestseller: true,
  },
  {
    id: 5,
    title: 'Cloud Computing with AWS',
    instructor: 'David Thompson',
    rating: 4.8,
    students: 7800,
    duration: '30 hours',
    image: 'https://images.unsplash.com/photo-1667984390553-7f439e6ae401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMGNvbXB1dGluZyUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzY0MTI3NTQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Cloud Computing',
    level: 'Intermediate',
    bestseller: false,
  },
  {
    id: 6,
    title: 'Cybersecurity Fundamentals',
    instructor: 'Rachel Kim',
    rating: 4.7,
    students: 4500,
    duration: '28 hours',
    image: 'https://images.unsplash.com/photo-1691435828932-911a7801adfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwbmV0d29ya3xlbnwxfHx8fDE3NjQwODQ2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Cybersecurity',
    level: 'Beginner',
    bestseller: false,
  },
  {
    id: 7,
    title: 'React & Next.js Masterclass',
    instructor: 'Sarah Johnson',
    rating: 4.9,
    students: 9200,
    duration: '40 hours',
    image: 'https://images.unsplash.com/photo-1593720213681-e9a8778330a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc2NDA5ODU0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Web Development',
    level: 'Advanced',
    bestseller: true,
  },
  {
    id: 8,
    title: 'Python for Data Analysis',
    instructor: 'Dr. Michael Chen',
    rating: 4.8,
    students: 11000,
    duration: '32 hours',
    image: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NjQxNjc0NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Data Science',
    level: 'Beginner',
    bestseller: false,
  },
];

export default function AllCourses({ navigate, isLoggedIn = false, userRole = 'guest', logout }: AllCoursesProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Courses');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredCourses = allCourses.filter((course) => {
    const matchesCategory = selectedCategory === 'All Courses' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden scrollbar-hide">
      <Navbar navigate={navigate} isLoggedIn={isLoggedIn} userRole={userRole} logout={handleLogout} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl mb-4">Explore Our Courses</h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Discover thousands of courses in Web Development, Data Science, Mobile Development, and more
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/95 backdrop-blur-sm border-0"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <Filter className="h-4 w-4 text-gray-500" />
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600">Categories</p>
                    <button
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                      aria-label="Toggle categories"
                    >
                      {isCategoriesOpen ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {isCategoriesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
                        />
                      </div>

                      <div className="max-h-64 overflow-y-auto scrollbar-hide space-y-1 mt-2">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <motion.button
                              key={category}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              onClick={() => setSelectedCategory(category)}
                              className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                                selectedCategory === category
                                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {category}
                            </motion.button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No categories found</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Courses Grid */}
          <div className="flex-1">
            {/* View Toggle & Results Count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredCourses.length}</span> courses
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-gradient-to-r from-violet-600 to-cyan-500' : ''}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gradient-to-r from-violet-600 to-cyan-500' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Courses Display */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-6'
              }
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden h-full">
                    <CardContent className="p-0">
                      <div
                        className={viewMode === 'grid' ? 'flex flex-col' : 'flex flex-col sm:flex-row'}
                        onClick={() => navigate('course-details')}
                      >
                        {/* Course Image */}
                        <div className={`relative overflow-hidden ${viewMode === 'grid' ? '' : 'sm:w-64'}`}>
                          <ImageWithFallback
                            src={course.image}
                            alt={course.title}
                            className={`w-full object-cover group-hover:scale-110 transition-transform duration-300 ${
                              viewMode === 'grid' ? 'h-48' : 'h-48 sm:h-full'
                            }`}
                          />
                          {course.bestseller && (
                            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                              Bestseller
                            </Badge>
                          )}
                          <Badge className="absolute top-3 right-3 bg-white/90 text-gray-700 border-0">
                            {course.level}
                          </Badge>
                        </div>

                        {/* Course Info */}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs">
                              {course.category}
                            </Badge>
                          </div>
                          <h3 className="mb-2 group-hover:text-violet-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-gray-900">{course.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{course.students.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{course.duration}</span>
                            </div>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-3 border-t">
                            <Button
                              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300 w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('course-details');
                              }}
                            >
                              Enroll
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No courses found matching your criteria</p>
                <Button
                  onClick={() => {
                    setSelectedCategory('All Courses');
                    setSearchQuery('');
                  }}
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}