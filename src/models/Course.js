import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true, // e.g. "3 Months", "6 Months"
  },
  fees: {
    type: Number,
    required: true, // e.g. 5000
  },
  image: {
    type: String, // Dynamic base64 image or image URL
    default: '',
  },
  // Expanded Course Details Fields
  abbreviation: {
    type: String,
    default: '',
  },
  prerequisites: {
    type: String,
    default: '',
  },
  outcomes: {
    type: String,
    default: '',
  },
  batchMode: {
    type: String,
    default: '',
  },
  keyboardSpeed: {
    type: String,
    default: '',
  },
  recommendedSoftware: {
    type: String,
    default: '',
  },
  eligibility: {
    type: String,
    default: '',
  },
  // Dynamic structured syllabus modules (e.g. Module 1: MS Word, etc.)
  syllabusModules: [
    {
      title: { type: String, default: '' },
      topics: { type: String, default: '' }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);
