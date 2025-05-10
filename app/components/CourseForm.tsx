"use client";

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Course {
  id: string;
  course_name: string;
  hours: number;
  tags: string;
  instructor_name: string;
  status: 'in_progress' | 'finished';
}

const CourseForm = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const rowsPerPage = 10;
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    course_name: '',
    hours: 0,
    tags: '',
    instructor_name: '',
    status: 'in_progress'
  });

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

  // Pagination calculations
  const totalPages = Math.ceil(courses.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentCourses = courses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.tags}</td>
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
                    <span className="font-medium">{Math.min(endIndex, courses.length)}</span> of{' '}
                    <span className="font-medium">{courses.length}</span> results
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