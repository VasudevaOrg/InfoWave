import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentSidebar from './Sidebar';

export const dynamic = 'force-dynamic';


export default async function StudentLayout({ children }) {
  await connectDB();
  const session = await verifyAuth('student');

  if (!session) {
    redirect('/login');
  }

  // Get fresh profile details of the student from DB
  const student = await User.findById(session.id);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <StudentSidebar
        studentName={student?.name}
        studentEmail={student?.email}
        studentPhoto={student?.profileImage}
      />
      <main style={{ flexGrow: 1, padding: '2rem 3rem', overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
