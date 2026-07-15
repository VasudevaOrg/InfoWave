import connectDB from '@/lib/db';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET: list all students and their enrollments (Admin only)
export async function GET() {
  try {
    await connectDB();
    const payload = await verifyAuth('admin');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all students
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });

    // For each student, find their enrollments
    const studentListWithEnrollments = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.find({ studentId: student._id })
          .populate('courseId')
          .sort({ enrolledAt: -1 });
        return {
          ...student._doc,
          enrollments,
        };
      })
    );

    // Get courses for dropdown/selection in student enrollment panel
    const courses = await Course.find().select('title duration');

    return NextResponse.json({
      success: true,
      students: studentListWithEnrollments,
      courses,
    });
  } catch (error) {
    console.error('API /admin/students GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Enroll a student OR create a student account (Admin only)
export async function POST(request) {
  try {
    await connectDB();
    const payload = await verifyAuth('admin');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Action 1: Create a student account
    if (action === 'create') {
      const {
        name,
        email,
        password,
        cellNo,
        address,
        profileImage,
        altCellNo,
        dob,
        gender,
        qualification,
        status,
        schoolCollege,
        district,
        state,
        pincode,
        admissionNo,
        bloodGroup,
        modeOfTraining,
        initialCourseId,
        academicHistory
      } = body;

      if (!name || !email || !password) {
        return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
      }

      const emailLower = email.toLowerCase();

      // Check if user already exists
      const userExists = await User.findOne({ email: emailLower });
      if (userExists) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }

      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash(password, 12);

      // Create new student user with expanded fields
      const newStudent = await User.create({
        name,
        email: emailLower,
        password: hashedPassword,
        role: 'student', // Force student role
        cellNo: cellNo || '',
        address: address || '',
        profileImage: profileImage || '',
        altCellNo: altCellNo || '',
        dob: dob || '',
        gender: gender || '',
        qualification: qualification || '',
        status: status || '',
        schoolCollege: schoolCollege || '',
        district: district || '',
        state: state || '',
        pincode: pincode || '',
        admissionNo: admissionNo || '',
        bloodGroup: bloodGroup || '',
        modeOfTraining: modeOfTraining || '',
        academicHistory: academicHistory || [],
      });

      // If initial course enrollment is requested, register it immediately
      if (initialCourseId) {
        await Enrollment.create({
          studentId: newStudent._id,
          courseId: initialCourseId,
          status: 'active', // Direct admin actions bypass pending flow
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Student account successfully created',
        student: {
          id: newStudent._id,
          name: newStudent.name,
          email: newStudent.email,
        }
      });
    }

    // Action 2: Enroll a student
    const { studentId, courseId } = body;
    if (!studentId || !courseId) {
      return NextResponse.json({ error: 'Student ID and Course ID are required' }, { status: 400 });
    }

    // Check if student already enrolled in this course
    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) {
      return NextResponse.json({ error: 'Student is already enrolled in this course' }, { status: 400 });
    }

    const newEnrollment = await Enrollment.create({
      studentId,
      courseId,
      status: 'active', // Direct admin enrollments bypass pending state
    });

    const populated = await newEnrollment.populate('courseId');

    return NextResponse.json({ success: true, enrollment: populated });
  } catch (error) {
    console.error('API /admin/students POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Modify enrollment state or student status (Admin only)
export async function PUT(request) {
  try {
    await connectDB();
    const payload = await verifyAuth('admin');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enrollmentId, studentId, action } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Handle student account active state toggle
    if (action === 'toggle_active') {
      if (!studentId) {
        return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
      }
      const student = await User.findById(studentId);
      if (!student) {
        return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
      }
      student.isActive = student.isActive === false ? true : false;
      await student.save();
      return NextResponse.json({ success: true, isActive: student.isActive });
    }

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment record not found' }, { status: 404 });
    }

    if (action === 'approve_enrollment') {
      enrollment.status = 'active';
      await enrollment.save();
      const populated = await enrollment.populate(['courseId', 'studentId']);
      return NextResponse.json({ success: true, enrollment: populated });
    }

    if (action === 'reject_enrollment') {
      await Enrollment.findByIdAndDelete(enrollmentId);
      return NextResponse.json({ success: true, message: 'Enrollment request rejected and deleted' });
    }

    if (action === 'mark_completed') {
      if (enrollment.status === 'completed') {
        return NextResponse.json({ error: 'Course is already marked as completed' }, { status: 400 });
      }
      enrollment.status = 'completed';
      if (!enrollment.completedAt) {
        enrollment.completedAt = new Date();
      }
      await enrollment.save();
      const populated = await enrollment.populate(['courseId', 'studentId']);
      return NextResponse.json({ success: true, enrollment: populated });
    }

    if (action === 'approve_certificate') {
      if (enrollment.status !== 'completed') {
        return NextResponse.json({ error: 'Course must be marked as completed before approving certificate requests' }, { status: 400 });
      }
      if (enrollment.certificateRequestStatus === 'approved') {
        return NextResponse.json({ error: 'Certificate has already been approved' }, { status: 400 });
      }

      // Generate unique certificate ID (e.g. IW-CERT-20260715-4D1E)
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const certificateId = `IW-CERT-${dateStr}-${randomHex}`;

      enrollment.certificateRequestStatus = 'approved';
      enrollment.certificateId = certificateId;
      if (!enrollment.completedAt) {
        enrollment.completedAt = new Date();
      }
      await enrollment.save();

      const populated = await enrollment.populate(['courseId', 'studentId']);
      return NextResponse.json({ success: true, enrollment: populated });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    console.error('API /admin/students PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
