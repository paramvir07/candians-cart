import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import Navbar from '@/components/customer/landing/Navbar';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const CustomerChangePasswordPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect('/customer/login');

  // phoneNumber comes from Better Auth session user
  const phoneNumber = (session.user as any).phoneNumber as string ?? "";

  if (!phoneNumber) redirect('/customer/profile');

  return (
    <div>
      <Navbar />
      <ChangePasswordForm phoneNumber={phoneNumber} />
    </div>
  );
};

export default CustomerChangePasswordPage;