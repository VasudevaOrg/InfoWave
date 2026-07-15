import connectDB from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const payload = await verifyAuth('student');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = payload.id;

    // Get all enrollments for this student
    const enrollments = await Enrollment.find({ studentId })
      .populate('courseId')
      .sort({ enrolledAt: -1 });

    const activeCourses = enrollments.filter((e) => e.status === 'active');
    const completedCourses = enrollments.filter((e) => e.status === 'completed');
    const pendingCourses = enrollments.filter((e) => e.status === 'pending');

    // Generate suggestions: courses that the student is NOT currently enrolled in
    const enrolledCourseIds = enrollments.map((e) => e.courseId?._id).filter(Boolean);
    const suggestions = await Course.find({
      _id: { $nin: enrolledCourseIds },
    })
      .limit(3)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      activeCourses,
      completedCourses,
      pendingCourses,
      suggestions,
    });
  } catch (error) {
    console.error('API /api/student/dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
