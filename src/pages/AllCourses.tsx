import { useState, useEffect } from 'react';
import { Star, Users, Clock, Filter, Grid, List, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ImageWithFallback } from '../components/Assets/ImageWithFallback';
import { COURSE_CATEGORIES } from '../constants/courseCategories';

interface AllCoursesProps {
  navigate: (page: string) => void;
  isLoggedIn?: boolean;
  userRole?: 'student' | 'instructor' | 'admin' | 'guest';
  logout?: () => void;
}

const categories = ['All Courses', ...Object.values(COURSE_CATEGORIES)];


export default function AllCourses({ navigate, isLoggedIn = false, userRole = 'guest', logout }: AllCoursesProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Courses');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/courses');
        const data = await res.json();
        setCourses(data.courses);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);


  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredCourses = courses.filter((course) => {
    const courseCategoryLabel =
      COURSE_CATEGORIES[course.category] || course.category;

    const matchesCategory =
      selectedCategory === 'All Courses' ||
      courseCategoryLabel === selectedCategory;

    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });


  if (loading) {
    return (
      <div className="text-center py-20 text-lg text-gray-600">
        Loading courses...
      </div>
    );
  }



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
                              className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${selectedCategory === category
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
                        onClick={() => {
                          localStorage.setItem('selectedCourseId', course.id.toString());

                          userRole === 'guest'
                            ? navigate('course-details-guest')
                            : navigate('course-details');
                        }}


                      >
                        {/* Course Image */}
                        <div className={`relative overflow-hidden ${viewMode === 'grid' ? '' : 'sm:w-64'}`}>
                          <ImageWithFallback
                            src={course.thumbnail}
                            alt={course.title}
                            className={`w-full object-cover group-hover:scale-110 transition-transform duration-300 ${viewMode === 'grid' ? 'h-48' : 'h-48 sm:h-full'
                              }`}
                          />

                          <Badge className="absolute top-3 right-3 bg-white/90 text-gray-700 border-0">
                            {course.level}
                          </Badge>
                        </div>

                        {/* Course Info */}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="mb-2">
                            <Badge >
                              {COURSE_CATEGORIES[course.category] || course.category}
                            </Badge>

                          </div>
                          <h3 className="mb-2 group-hover:text-violet-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{course.instructor_name}</p>


                          <div className="mt-auto flex items-center justify-between pt-3">
                            <Button
                              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 transition-all duration-300 w-full"
                              onClick={(e) => {
                                e.stopPropagation();

                                localStorage.setItem(
                                  'selectedCourseId',
                                  course.id.toString()
                                );

                                if (userRole === 'guest') {
                                  navigate('course-details-guest');
                                } else {
                                  navigate('course-details');
                                }
                              }}

                            >
                              View Course
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