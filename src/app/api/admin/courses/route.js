import connectDB from '@/lib/db';
import Course from '@/models/Course';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET: list all courses (accessible by anyone)
export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error('API /admin/courses GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add new course (Admin only)
export async function POST(request) {
  try {
    await connectDB();
    const payload = await verifyAuth('admin');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      duration,
      fees,
      image,
      abbreviation,
      prerequisites,
      outcomes,
      batchMode,
      keyboardSpeed,
      recommendedSoftware,
      eligibility,
      syllabusModules
    } = body;

    if (!title || !description || !duration || !fees) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if course already exists
    const courseExists = await Course.findOne({ title });
    if (courseExists) {
      return NextResponse.json({ error: 'Course with this title already exists' }, { status: 400 });
    }

    const newCourse = await Course.create({
      title,
      description,
      duration,
      fees: Number(fees),
      image: image || '',
      abbreviation: abbreviation || '',
      prerequisites: prerequisites || '',
      outcomes: outcomes || '',
      batchMode: batchMode || '',
      keyboardSpeed: keyboardSpeed || '',
      recommendedSoftware: recommendedSoftware || '',
      eligibility: eligibility || '',
      syllabusModules: syllabusModules || [],
    });

    return NextResponse.json({ success: true, course: newCourse });
  } catch (error) {
    console.error('API /admin/courses POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update a course (Admin only)
export async function PUT(request) {
  try {
    await connectDB();
    const payload = await verifyAuth('admin');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      duration,
      fees,
      image,
      abbreviation,
      prerequisites,
      outcomes,
      batchMode,
      keyboardSpeed,
      recommendedSoftware,
      eligibility,
      syllabusModules
    } = body;

    if (!id || !title || !description || !duration || !fees) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        title,
        description,
        duration,
        fees: Number(fees),
        image: image || '',
        abbreviation: abbreviation || '',
        prerequisites: prerequisites || '',
        outcomes: outcomes || '',
        batchMode: batchMode || '',
        keyboardSpeed: keyboardSpeed || '',
        recommendedSoftware: recommendedSoftware || '',
        eligibility: eligibility || '',
        syllabusModules: syllabusModules || [],
      },
      { new: true }
    );

    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error('API /admin/courses PUT error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove a course (Admin only)
export async function DELETE(request) {
  try {
    await connectDB();
    const payload = await verifyAuth('admin');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Also delete enrollments for this course
    const { default: Enrollment } = await import('@/models/Enrollment');
    await Enrollment.deleteMany({ courseId: id });

    return NextResponse.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('API /admin/courses DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
