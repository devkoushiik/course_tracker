import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("course_tracker");
    const courses = await db.collection("courses").find({}).toArray();
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("course_tracker");
    const course = await request.json();
    
    // Check for duplicate course
    const existingCourse = await db.collection("courses").findOne({
      course_name: { $regex: new RegExp(`^${course.course_name}$`, 'i') },
      instructor_name: { $regex: new RegExp(`^${course.instructor_name}$`, 'i') }
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'This course with the same instructor already exists!' },
        { status: 400 }
      );
    }

    const result = await db.collection("courses").insertOne(course);
    return NextResponse.json({ ...course, _id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("course_tracker");
    const course = await request.json();
    const { _id, ...updateData } = course;

    const result = await db.collection("courses").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("course_tracker");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const result = await db.collection("courses").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
} 