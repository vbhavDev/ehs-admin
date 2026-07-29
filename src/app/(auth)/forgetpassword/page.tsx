import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/modules/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | EHS Admin',
  description: 'Reset your EHS Admin password.',
};

export default function ForgetPasswordPage() {
  return <ForgotPasswordForm />;
}
