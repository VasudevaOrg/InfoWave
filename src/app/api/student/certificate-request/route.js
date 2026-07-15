import connectDB from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectDB();
    const payload = await verifyAuth('student');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enrollmentId } = await request.json();
    const studentId = payload.id;

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 });
    }

    const enrollment = await Enrollment.findOne({ _id: enrollmentId, studentId });
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment record not found' }, { status: 404 });
    }

    if (enrollment.status !== 'completed') {
      return NextResponse.json({ error: 'Course must be marked as completed by instructor first' }, { status: 400 });
    }

    if (enrollment.certificateRequestStatus === 'requested') {
      return NextResponse.json({ error: 'Certificate has already been requested' }, { status: 400 });
    }

    if (enrollment.certificateRequestStatus === 'approved') {
      return NextResponse.json({ error: 'Certificate has already been approved and issued' }, { status: 400 });
    }

    enrollment.certificateRequestStatus = 'requested';
    await enrollment.save();

    return NextResponse.json({ success: true, message: 'Certificate request submitted to admin successfully' });
  } catch (error) {
    console.error('API /api/student/certificate-request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
