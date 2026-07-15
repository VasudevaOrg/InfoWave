import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from './Sidebar';

export const dynamic = 'force-dynamic';


export default async function AdminLayout({ children }) {
  await connectDB();
  const session = await verifyAuth('admin');

  if (!session) {
    redirect('/login');
  }

  // Get fresh profile details of the admin from DB
  const admin = await User.findById(session.id);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <AdminSidebar
        adminName={admin?.name}
        adminEmail={admin?.email}
        adminPhoto={admin?.profileImage}
      />
      <main style={{ flexGrow: 1, padding: '2rem 3rem', overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
