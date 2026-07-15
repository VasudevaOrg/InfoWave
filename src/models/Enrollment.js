import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending',
  },
  certificateRequestStatus: {
    type: String,
    enum: ['none', 'requested', 'approved'],
    default: 'none',
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  certificateId: {
    type: String, // Unique verification code e.g. "CERT-IW-XXXXXXXX"
    unique: true,
    sparse: true, // Allows multiple null/undefined values
  },
});

// Force deletion of model from Mongoose cache in development to reload schema changes
if (mongoose.models.Enrollment) {
  delete mongoose.models.Enrollment;
}

export default mongoose.model('Enrollment', EnrollmentSchema);
