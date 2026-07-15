import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student',
  },
  cellNo: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  // Expansive student-specific fields
  altCellNo: {
    type: String,
    default: '',
  },
  dob: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },
  qualification: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  schoolCollege: {
    type: String,
    default: '',
  },
  district: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  pincode: {
    type: String,
    default: '',
  },
  admissionNo: {
    type: String,
    default: '',
  },
  bloodGroup: {
    type: String,
    default: '',
  },
  modeOfTraining: {
    type: String,
    default: '',
  },
  // Institution details (Admin specific)
  institutionName: {
    type: String,
    default: '',
  },
  registrationNo: {
    type: String,
    default: '',
  },
  establishedYear: {
    type: String,
    default: '',
  },
  gstNo: {
    type: String,
    default: '',
  },
  websiteUrl: {
    type: String,
    default: '',
  },
  // Dynamic structured academic timeline history
  academicHistory: [
    {
      qualification: { type: String, default: '' },
      institution: { type: String, default: '' },
      passingYear: { type: String, default: '' },
      percentage: { type: String, default: '' },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Force deletion of model from Mongoose cache in development to reload schema changes
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
