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
  const rowsPerPage = 10;
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    course_name: '',
    hours: 0,
    tags: '',
    instructor_name: '',
    status: 'in_progress'
  });

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
        stats.tag[trimmedTag] = (stats.tag[trimmedTag] || 0) + 1;
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

  useEffect(() => {
    // Clear localStorage for testing
    localStorage.removeItem('courses');
    
    const savedCourses = localStorage.getItem('courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      // TODO: Remove this dummy data later
      const dummyCourses: Course[] = [
        { id: '1', course_name: 'React Fundamentals', hours: 12, tags: 'React, JavaScript', instructor_name: 'John Doe', status: 'finished' },
        { id: '2', course_name: 'Advanced TypeScript', hours: 15, tags: 'TypeScript, JavaScript', instructor_name: 'Jane Smith', status: 'in_progress' },
        { id: '3', course_name: 'Node.js Masterclass', hours: 20, tags: 'Node.js, JavaScript', instructor_name: 'Mike Johnson', status: 'finished' },
        { id: '4', course_name: 'Python for Data Science', hours: 25, tags: 'Python, Data Science', instructor_name: 'Sarah Wilson', status: 'in_progress' },
        { id: '5', course_name: 'Machine Learning Basics', hours: 30, tags: 'ML, Python', instructor_name: 'David Brown', status: 'finished' },
        { id: '6', course_name: 'Web Development Bootcamp', hours: 40, tags: 'HTML, CSS, JavaScript', instructor_name: 'Emily Davis', status: 'in_progress' },
        { id: '7', course_name: 'Docker & Kubernetes', hours: 18, tags: 'DevOps, Docker', instructor_name: 'Chris Lee', status: 'finished' },
        { id: '8', course_name: 'AWS Cloud Practitioner', hours: 22, tags: 'AWS, Cloud', instructor_name: 'Lisa Anderson', status: 'in_progress' },
        { id: '9', course_name: 'GraphQL API Design', hours: 14, tags: 'GraphQL, API', instructor_name: 'Tom Wilson', status: 'finished' },
        { id: '10', course_name: 'MongoDB Mastery', hours: 16, tags: 'MongoDB, Database', instructor_name: 'Rachel Green', status: 'in_progress' },
        { id: '11', course_name: 'Flutter Development', hours: 28, tags: 'Flutter, Mobile', instructor_name: 'Alex Turner', status: 'finished' },
        { id: '12', course_name: 'DevOps Essentials', hours: 24, tags: 'DevOps, CI/CD', instructor_name: 'Sophie Martin', status: 'in_progress' },
        { id: '13', course_name: 'Blockchain Basics', hours: 20, tags: 'Blockchain, Crypto', instructor_name: 'James Wilson', status: 'finished' },
        { id: '14', course_name: 'UI/UX Design', hours: 18, tags: 'Design, Figma', instructor_name: 'Emma Thompson', status: 'in_progress' },
        { id: '15', course_name: 'Cybersecurity Fundamentals', hours: 25, tags: 'Security, Network', instructor_name: 'Daniel Clark', status: 'finished' }
      ];
      setCourses(dummyCourses);
      localStorage.setItem('courses', JSON.stringify(dummyCourses));
    }
  }, []);

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

  // Pagination calculations with filtered courses
  const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      tag: '',
      instructor: '',
      status: ''
    });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8">
      <Toaster />
      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-purple-dark via-purple-medium to-purple-light mb-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input
                type="number"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-purple-dark via-purple-medium to-purple-light mb-8">
        <div className="bg-white rounded-lg p-6">
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Instructor</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
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

      <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-purple-dark via-purple-medium to-purple-light">
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
        </div>
      </div>
    </div>
  );
};

export default CourseForm; 