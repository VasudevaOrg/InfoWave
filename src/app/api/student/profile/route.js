import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    await connectDB();
    const payload = await verifyAuth('student');
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      cellNo,
      address,
      profileImage,
      password,
      altCellNo,
      dob,
      gender,
      qualification,
      status,
      schoolCollege,
      district,
      state,
      pincode,
      bloodGroup
    } = body;

    const student = await User.findById(payload.id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (name) student.name = name;
    if (cellNo !== undefined) student.cellNo = cellNo;
    if (address !== undefined) student.address = address;
    if (profileImage !== undefined) student.profileImage = profileImage;
    if (altCellNo !== undefined) student.altCellNo = altCellNo;
    if (dob !== undefined) student.dob = dob;
    if (gender !== undefined) student.gender = gender;
    if (qualification !== undefined) student.qualification = qualification;
    if (status !== undefined) student.status = status;
    if (schoolCollege !== undefined) student.schoolCollege = schoolCollege;
    if (district !== undefined) student.district = district;
    if (state !== undefined) student.state = state;
    if (pincode !== undefined) student.pincode = pincode;
    if (bloodGroup !== undefined) student.bloodGroup = bloodGroup;

    if (password) {
      student.password = await bcrypt.hash(password, 12);
    }

    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        cellNo: student.cellNo,
        address: student.address,
        profileImage: student.profileImage,
      },
    });
  } catch (error) {
    console.error('API /api/student/profile PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
