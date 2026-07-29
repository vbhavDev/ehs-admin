import SignUpForm from '@/components/auth/SignUpForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | EHS Admin',
  description: 'Create a new EHS Admin account.',
};

export default function SignupPage() {
  return <SignUpForm />;
}
