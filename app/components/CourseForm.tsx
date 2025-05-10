"use client";

import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Course {
  id: string;
  course_name: string;
  hours: number;
  tags: string;
  instructor_name: string;
  status: 'in_progress' | 'finished';
}

interface FilterStats {
  tag: { [key: string]: number };
  instructor: { [key: string]: number };
  status: { [key: string]: number };
}

const CourseForm = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [filters, setFilters] = useState({
    tag: '',
    instructor: '',
    status: ''
  });
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [canConfirm, setCanConfirm] = useState(false);
  const rowsPerPage = 10;
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    course_name: '',
    hours: 0,
    tags: '',
    instructor_name: '',
    status: 'in_progress'
  });

  useEffect(() => {
    // Load saved courses from localStorage
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
  }, []);

  // Calculate filter stats
  const filterStats = useMemo(() => {
    const stats: FilterStats = {
      tag: {},
      instructor: {},
      status: {}
    };

    courses.forEach(course => {
      // Count tags
      course.tags.split(',').forEach(tag => {
        const trimmedTag = tag.trim();
        if (trimmedTag) {
          stats.tag[trimmedTag] = (stats.tag[trimmedTag] || 0) + 1;
        }
      });

      // Count instructors
      stats.instructor[course.instructor_name] = (stats.instructor[course.instructor_name] || 0) + 1;

      // Count status
      stats.status[course.status] = (stats.status[course.status] || 0) + 1;
    });

    return stats;
  }, [courses]);

  // Filter courses based on selected filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesTag = !filters.tag || course.tags.split(',').some(tag => tag.trim() === filters.tag);
      const matchesInstructor = !filters.instructor || course.instructor_name === filters.instructor;
      const matchesStatus = !filters.status || course.status === filters.status;
      return matchesTag && matchesInstructor && matchesStatus;
    });
  }, [courses, filters]);

  // Get unique values for filter dropdowns
  const uniqueTags = useMemo(() => Object.keys(filterStats.tag), [filterStats.tag]);
  const uniqueInstructors = useMemo(() => Object.keys(filterStats.instructor), [filterStats.instructor]);
  const uniqueStatuses = useMemo(() => Object.keys(filterStats.status), [filterStats.status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCourse) {
      // Update existing course
      const updatedCourses = courses.map(course => 
        course.id === editingCourse.id 
          ? { ...formData, id: course.id }
          : course
      );
      setCourses(updatedCourses);
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      setEditingCourse(null);
      toast.success('Course updated successfully!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#7A1CAC',
          color: '#fff',
        },
      });
    } else {
      // Add new course
      const isDuplicate = courses.some(
        course => 
          course.course_name.toLowerCase() === formData.course_name.toLowerCase() &&
          course.instructor_name.toLowerCase() === formData.instructor_name.toLowerCase()
      );

      if (isDuplicate) {
        toast.error('This course with the same instructor already exists!', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#2E073F',
            color: '#fff',
          },
        });
        return;
      }

      const newCourse = {
        ...formData,
        id: Date.now().toString()
      };
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      toast.success('Course added successfully!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#7A1CAC',
          color: '#fff',
        },
      });
    }

    setFormData({
      course_name: '',
      hours: 0,
      tags: '',
      instructor_name: '',
      status: 'in_progress'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours' ? Number(value) : value
    }));
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      course_name: course.course_name,
      hours: course.hours,
      tags: course.tags,
      instructor_name: course.instructor_name,
      status: course.status
    });
  };

  const handleDelete = (courseId: string) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    setCourses(updatedCourses);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    toast.success('Course deleted successfully!', {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#7A1CAC',
        color: '#fff',
      },
    });
  };

  const handleCancel = () => {
    setEditingCourse(null);
    setFormData({
      course_name: '',
      hours: 0,
      tags: '',
      instructor_name: '',
      status: 'in_progress'
    });
  };

  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      tag: '',
      instructor: '',
      status: ''
    });
    setCurrentPage(1);
  };

  const handleClearAllCourses = () => {
    setShowWarning(true);
    setCountdown(10);
    setCanConfirm(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showWarning && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) {
          setCanConfirm(true);
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showWarning, countdown]);

  const confirmClearAll = () => {
    if (!canConfirm) return;
    setCourses([]);
    localStorage.removeItem('courses');
    setShowWarning(false);
    setCanConfirm(false);
    toast.success('All courses have been cleared!', {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#7A1CAC',
        color: '#fff',
      },
    });
  };

  // Pagination calculations with filtered courses
  const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8">
      <Toaster />
      
      {/* Course Input Form */}
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-purple-dark/30 via-purple-medium/30 to-purple-light/30 mb-8">
        <div className="bg-white rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-1">Course Name</label>
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="e.g., React Fundamentals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-1">Hours</label>
                <input
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  min="0"
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-1">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., React, JavaScript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-1">Instructor Name</label>
                <input
                  type="text"
                  name="instructor_name"
                  value={formData.instructor_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </button>
                {editingCourse && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Filters Section */}
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-purple-dark/30 via-purple-medium/30 to-purple-light/30 mb-8">
        <div className="bg-white rounded-lg p-6">
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-purple-600 mb-1">Filter by Tag</label>
              <select
                value={filters.tag}
                onChange={(e) => handleFilterChange('tag', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Tags</option>
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag} ({filterStats.tag[tag]})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-purple-600 mb-1">Filter by Instructor</label>
              <select
                value={filters.instructor}
                onChange={(e) => handleFilterChange('instructor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Instructors</option>
                {uniqueInstructors.map(instructor => (
                  <option key={instructor} value={instructor}>
                    {instructor} ({filterStats.instructor[instructor]})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-purple-600 mb-1">Filter by Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'finished' ? 'Finished' : 'In Progress'} ({filterStats.status[status]})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>

          {/* Stats Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800">Total Courses</h3>
              <p className="mt-1 text-2xl font-semibold text-purple-900">
                {filteredCourses.length}
                <span className="text-sm font-normal text-purple-600 ml-2">
                  {filters.tag || filters.instructor || filters.status ? '(Filtered)' : ''}
                </span>
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800">Total Instructors</h3>
              <p className="mt-1 text-2xl font-semibold text-purple-900">
                {Object.keys(filterStats.instructor).length}
                <span className="text-sm font-normal text-purple-600 ml-2">
                  {filters.instructor ? '(Filtered)' : ''}
                </span>
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800">Total Hours</h3>
              <p className="mt-1 text-2xl font-semibold text-purple-900">
                {filteredCourses.reduce((sum, course) => sum + course.hours, 0)}
                <span className="text-sm font-normal text-purple-600 ml-2">
                  {filters.tag || filters.instructor || filters.status ? '(Filtered)' : ''}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-purple-dark/30 via-purple-medium/30 to-purple-light/30">
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 via-purple-100/50 to-purple-50 border-b border-purple-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Course Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCourses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.course_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-1 mb-1 ${
                          filters.tag === tag.trim()
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.instructor_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      course.status === 'finished' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status === 'finished' ? 'Finished' : 'In Progress'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={6} className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredCourses.length)}</span> of{' '}
                      <span className="font-medium">{filteredCourses.length}</span> results
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredCourses.length)}</span> of{' '}
                    <span className="font-medium">{filteredCourses.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* Clear All Courses Button */}
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={handleClearAllCourses}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Courses
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Warning: Clear All Courses</h3>
            <p className="text-gray-600 mb-4">
              This action will permanently delete all courses. This data will be lost forever.
            </p>
            <div className="text-center mb-4">
              {countdown > 0 ? (
                <>
                  <span className="text-2xl font-bold text-purple-600">{countdown}</span>
                  <span className="text-gray-600 ml-2">seconds remaining</span>
                </>
              ) : (
                <span className="text-lg font-medium text-red-600">Ready to confirm deletion</span>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWarning(false);
                  setCanConfirm(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className={`px-4 py-2 rounded-md transition-colors ${
                  canConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canConfirm}
              >
                {countdown > 0 ? `Confirm (${countdown}s)` : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <a
              href="https://github.com/devkoushiik"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover:text-purple-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Developed by Koushik Ahmed</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CourseForm; 