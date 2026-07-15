import connectDB from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    const payload = await verifyAuth('student');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await request.json();
    const studentId = payload.id;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) {
      return NextResponse.json({ error: 'Already enrolled in or requested this course' }, { status: 400 });
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      status: 'pending',
      certificateRequestStatus: 'none',
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error('API /api/student/enroll error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
