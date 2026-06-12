import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (user) return <Navigate to="/" />;

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100 flex-col space-y-4">
      <RegisterForm />
      <div className="text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-emerald-600 hover:underline">Login</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
