import connectDB from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const payload = await verifyAuth('admin');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const activeEnrollments = totalEnrollments - completedEnrollments;

    // Get enrollment distribution by course
    const enrollments = await Enrollment.find().populate('courseId');
    const courseStatsMap = {};
    enrollments.forEach((e) => {
      if (e.courseId) {
        const title = e.courseId.title;
        courseStatsMap[title] = (courseStatsMap[title] || 0) + 1;
      }
    });

    const courseDistribution = Object.entries(courseStatsMap).map(([name, value]) => ({
      name,
      students: value,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        completedEnrollments,
        activeEnrollments,
        courseDistribution,
      },
    });
  } catch (error) {
    console.error('API /admin/stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
