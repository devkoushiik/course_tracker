import Image from "next/image";
import CourseForm from './components/CourseForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <CourseForm />
    </main>
  );
}
