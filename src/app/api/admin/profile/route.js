import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    await connectDB();
    const payload = await verifyAuth('admin');
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
      institutionName,
      registrationNo,
      establishedYear,
      gstNo,
      websiteUrl,
      district,
      state,
      pincode
    } = body;

    const admin = await User.findById(payload.id);
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    if (name) admin.name = name;
    if (cellNo !== undefined) admin.cellNo = cellNo;
    if (address !== undefined) admin.address = address;
    if (profileImage !== undefined) admin.profileImage = profileImage;
    if (altCellNo !== undefined) admin.altCellNo = altCellNo;
    if (institutionName !== undefined) admin.institutionName = institutionName;
    if (registrationNo !== undefined) admin.registrationNo = registrationNo;
    if (establishedYear !== undefined) admin.establishedYear = establishedYear;
    if (gstNo !== undefined) admin.gstNo = gstNo;
    if (websiteUrl !== undefined) admin.websiteUrl = websiteUrl;
    if (district !== undefined) admin.district = district;
    if (state !== undefined) admin.state = state;
    if (pincode !== undefined) admin.pincode = pincode;

    if (password) {
      admin.password = await bcrypt.hash(password, 12);
    }

    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        cellNo: admin.cellNo,
        address: admin.address,
        profileImage: admin.profileImage,
      },
    });
  } catch (error) {
    console.error('API /admin/profile PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
