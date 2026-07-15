import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      // Seed Admin, Student Profiles, and default courses
      try {
        await seedAdmin();
        await seedStudent();
        await seedCourses();
      } catch (err) {
        console.error('Database seeding failed:', err);
      }
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

async function seedAdmin() {
  const { default: User } = await import('@/models/User');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@infowave.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin_infowave_2026';

  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await User.create({
      name: 'Gummudu Srinivasarao',
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      cellNo: '9502995059',
      address: 'Near Post Office Kothakota Village, Ravikamatham Mandal, Anakapalli Dist- 531114',
      profileImage: ''
    });
    console.log(`[SEED] Admin account successfully pre-seeded: ${adminEmail}`);
  }
}

async function seedStudent() {
  const { default: User } = await import('@/models/User');
  const { default: Course } = await import('@/models/Course');
  const { default: Enrollment } = await import('@/models/Enrollment');

  // 1. Maintain Rahul profile in background
  const rahulExists = await User.findOne({ email: 'rahul@student.com' });
  if (!rahulExists) {
    const hashedPassword = await bcrypt.hash('student123', 12);
    await User.create({
      name: 'Rahul Kumar',
      email: 'rahul@student.com',
      password: hashedPassword,
      role: 'student',
      cellNo: '9876543210',
      address: 'Anakapalli Main Road, Anakapalli, A.P. - 531001',
      profileImage: ''
    });
  }

  // 2. Freshly seed 'demo@student.com' with complete details on every run
  const demoEmail = 'demo@student.com';
  await User.deleteOne({ email: demoEmail });

  const hashedPassword = await bcrypt.hash('student123', 12);
  const demoUser = await User.create({
    name: 'Demo Student Profile',
    email: demoEmail,
    password: hashedPassword,
    role: 'student',
    cellNo: '9988776655',
    altCellNo: '8877665544',
    dob: '2004-05-15',
    gender: 'Male',
    qualification: 'Intermediate completed, pursuing computer applications training.',
    status: 'Student',
    schoolCollege: 'Anakapalli Junior College',
    address: 'Near Post Office, Kothakota Village',
    district: 'Anakapalli',
    state: 'Andhra Pradesh',
    pincode: '531114',
    admissionNo: 'IW-2026-DEMO',
    bloodGroup: 'O+',
    modeOfTraining: 'Daily Class',
    profileImage: '',
    academicHistory: [
      {
        qualification: '10th Class',
        institution: 'Kothakota ZP High School',
        passingYear: '2020',
        percentage: '9.0 GPA'
      },
      {
        qualification: 'Intermediate (12th)',
        institution: 'Anakapalli Govt Junior College',
        passingYear: '2022',
        percentage: '86%'
      }
    ]
  });

  // Automatically enroll the demo student in DCA (or the first course)
  const dcaCourse = await Course.findOne({ title: { $regex: 'DCA', $options: 'i' } });
  const courseToEnroll = dcaCourse || await Course.findOne();
  
  if (courseToEnroll) {
    await Enrollment.deleteOne({ studentId: demoUser._id, courseId: courseToEnroll._id });
    await Enrollment.create({
      studentId: demoUser._id,
      courseId: courseToEnroll._id,
      status: 'active',
      enrolledAt: new Date()
    });
  }

  console.log(`[SEED] Demo student successfully seeded: ${demoEmail} (Password: student123)`);
}

async function seedCourses() {
  const { default: Course } = await import('@/models/Course');

  // If courses already exist, let's clear them and seed with complete syllabus structures
  await Course.deleteMany({});

  const defaultCourses = [
    {
      title: 'DCA (Diploma in Computer Applications)',
      description: 'Comprehensive introduction to computer operations, office productivity tools, and basic programming.',
      duration: '3 Months',
      fees: 3500,
      image: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      abbreviation: 'DCA',
      eligibility: '10th Standard or equivalent',
      recommendedSoftware: 'MS Office 2016, Notepad++',
      prerequisites: 'Basic English reading skills',
      outcomes: 'Proficiency in office tasks, file systems management, and data entries',
      batchMode: 'Daily Class',
      keyboardSpeed: '25+ WPM recommended',
      syllabusModules: [
        { title: 'Module 1: Operating System Fundamentals', topics: 'File hierarchies, explorer navigation, printing systems, desktop controls.' },
        { title: 'Module 2: MS Office Tools Mastery', topics: 'MS Word letters, Excel computation formulas, PowerPoint slide decks.' },
        { title: 'Module 3: Web Browsing & Email', topics: 'Search operations, email setups, utility programs, secure cloud storage.' }
      ]
    },
    {
      title: 'PGDCA (Post Graduate Diploma in Computer Applications)',
      description: 'Advanced course covering software engineering, database systems, networking, and programming languages.',
      duration: '6 Months',
      fees: 6500,
      image: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      abbreviation: 'PGDCA',
      eligibility: 'Any Graduation Degree',
      recommendedSoftware: 'MS Access, Visual Studio, SQL Server',
      prerequisites: 'Prior basic computer knowledge',
      outcomes: 'Software configuration, database manipulation, and systems analysis skills',
      batchMode: 'Daily Class',
      keyboardSpeed: '30+ WPM recommended',
      syllabusModules: [
        { title: 'Module 1: Programming Concepts & OOP', topics: 'Logic structures, compiling frameworks, console inputs/outputs.' },
        { title: 'Module 2: Database Management (DBMS)', topics: 'SQL queries, relational modeling, entity architectures.' },
        { title: 'Module 3: Systems Administration', topics: 'Networking infrastructure, server setups, basic troubleshooting.' }
      ]
    },
    {
      title: 'Tally with GST',
      description: 'Master professional accounting, inventory ledgers, tax returns, and corporate invoice setups using Tally.',
      duration: '2 Months',
      fees: 3000,
      image: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      abbreviation: 'TALLY',
      eligibility: '10th Class or Commerce background',
      recommendedSoftware: 'Tally Prime, MS Excel',
      prerequisites: 'Basic math and logic fundamentals',
      outcomes: 'Mastery in generating ledger statements, balance sheets, and GST tax filings',
      batchMode: 'Daily Class',
      keyboardSpeed: 'N/A',
      syllabusModules: [
        { title: 'Module 1: Accounting Principles', topics: 'Double-entry books, journal records, general ledger balances.' },
        { title: 'Module 2: Inventory Operations', topics: 'Stock vouchers, godown management, invoice numbering.' },
        { title: 'Module 3: Statutory & GST Taxes', topics: 'CGST/SGST ledger configurations, GSTR filing portals, tax deductions.' }
      ]
    },
    {
      title: 'MS Office (Word, Excel, PowerPoint)',
      description: 'Master formatting, formulas, presentations, and digital administration operations.',
      duration: '2 Months',
      fees: 2000,
      image: 'linear-gradient(135deg, #1e130c 0%, #9a8478 100%)',
      abbreviation: 'MS-OFFICE',
      eligibility: 'No criteria (open to all)',
      recommendedSoftware: 'MS Office Suite 2019/365',
      prerequisites: 'Basic typing awareness',
      outcomes: 'Creating highly formatted documents, spreadsheet models, and interactive presentations',
      batchMode: 'Daily Class',
      keyboardSpeed: '20+ WPM recommended',
      syllabusModules: [
        { title: 'Module 1: MS Word Formatting', topics: 'Styles, sections, page margins, document templates, print layouts.' },
        { title: 'Module 2: MS Excel Spreadsheet Formulas', topics: 'VLOOKUP, IF conditions, Pivot tables, graphical charts, formatting rules.' },
        { title: 'Module 3: MS PowerPoint Slide Design', topics: 'Transitions, animations, multimedia embeds, master slide layouts.' }
      ]
    },
    {
      title: 'Photoshop & Graphics Designing',
      description: 'Acquire professional skills in design structures, color templates, banners, flyers, and layouts.',
      duration: '2 Months',
      fees: 2500,
      image: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
      abbreviation: 'PHOTOSHOP',
      eligibility: '10th Standard recommended',
      recommendedSoftware: 'Adobe Photoshop, CorelDraw',
      prerequisites: 'Aesthetic layout awareness',
      outcomes: 'Master image manipulation, background editing, graphic layout design, and logo design',
      batchMode: 'Daily Class',
      keyboardSpeed: 'N/A',
      syllabusModules: [
        { title: 'Module 1: Canvas Controls & Selections', topics: 'Layer concepts, masks, lasso tools, quick selections.' },
        { title: 'Module 2: Retouching & Color Manipulation', topics: 'Clone stamping, healing brushes, curves and levels adjustments.' },
        { title: 'Module 3: Commercial Layout Prints', topics: 'Designing marketing pamphlets, digital banners, visiting cards.' }
      ]
    },
    {
      title: 'Python Programming',
      description: 'Beginner-friendly introduction to programming logic, variables, scripting, data engineering, and automation.',
      duration: '3 Months',
      fees: 4000,
      image: 'linear-gradient(135deg, #8a2387 0%, #e94057 100%, #f27121 100%)',
      abbreviation: 'PYTHON',
      eligibility: 'Intermediate or basic arithmetic logic',
      recommendedSoftware: 'Python 3.10+, VS Code',
      prerequisites: 'Basic mathematics logic',
      outcomes: 'Writing clean Python scripts, data processing, object modeling, and automation procedures',
      batchMode: 'Daily Class',
      keyboardSpeed: '25+ WPM recommended',
      syllabusModules: [
        { title: 'Module 1: Basic Syntaxes & Structures', topics: 'Loops, if-else, lists, dictionaries, functions, tuple operations.' },
        { title: 'Module 2: Object Oriented Concepts (OOP)', topics: 'Class definitions, inheritances, methods overrides, file I/O operations.' },
        { title: 'Module 3: Standard Libraries', topics: 'Math modules, datetime controls, request calls, data operations.' }
      ]
    },
    {
      title: 'C & C++ Programming',
      description: 'Deep-dive into software compilation, memory allocations, pointers, and algorithms.',
      duration: '3 Months',
      fees: 3500,
      image: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
      abbreviation: 'C/C++',
      eligibility: 'Basic programming logical math',
      recommendedSoftware: 'Turbo C++ or GCC Compiler',
      prerequisites: 'Basic arithmetic understanding',
      outcomes: 'Strong foundation in systems logic, algorithms, and core programming paradigms',
      batchMode: 'Daily Class',
      keyboardSpeed: '25+ WPM recommended',
      syllabusModules: [
        { title: 'Module 1: C basics', topics: 'Data types, loops, nested conditionals, array indices, structures.' },
        { title: 'Module 2: Memory Administration', topics: 'Pointers declarations, dynamic allocation, function call references.' },
        { title: 'Module 3: C++ OOP Features', topics: 'Class definitions, operator overloading, templates, standard template library.' }
      ]
    },
    {
      title: 'Typing (English & Telugu)',
      description: 'Build typing speed and accuracy in both Telugu and English layouts.',
      duration: '1 Month',
      fees: 1500,
      image: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
      abbreviation: 'TYPING',
      eligibility: 'No criteria (open to all)',
      recommendedSoftware: 'Typing Master, Telugu Unicode keyboard',
      prerequisites: 'None',
      outcomes: 'High typing speeds with zero looking-at-keyboard habits',
      batchMode: 'Daily Class',
      keyboardSpeed: 'Goal: 35+ WPM',
      syllabusModules: [
        { title: 'Module 1: Keyboards Layout Guide', topics: 'Home row coordinates, finger placements, shift key controls.' },
        { title: 'Module 2: Speed Practice', topics: 'Word drills, paragraphs checks, custom speed trackers.' },
        { title: 'Module 3: Regional Language', topics: 'Telugu keyboard mappings, accents alignments, text editing.' }
      ]
    },
    {
      title: 'Internet & Basic Computer Knowledge',
      description: 'Learn secure online browsing, email communications, digital transactions, and computer parts setup.',
      duration: '1 Month',
      fees: 1000,
      image: 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)',
      abbreviation: 'INTERNET',
      eligibility: 'No criteria',
      recommendedSoftware: 'Google Chrome, Microsoft Edge',
      prerequisites: 'None',
      outcomes: 'General computer operational capabilities and safe internet utilities navigation',
      batchMode: 'Daily Class',
      keyboardSpeed: 'N/A',
      syllabusModules: [
        { title: 'Module 1: Hardware Parts Guide', topics: 'Mouse coordinates, CPU ports, monitor setup, storage drives.' },
        { title: 'Module 2: Secure Browsing', topics: 'Google search methods, bookmark manager, virus controls.' },
        { title: 'Module 3: Daily Digital Tools', topics: 'Creating email accounts, processing payments, cloud drive storage backups.' }
      ]
    }
  ];

  await Course.insertMany(defaultCourses);
  console.log(`[SEED] Pre-seeded ${defaultCourses.length} default training courses.`);
}

export default connectDB;
