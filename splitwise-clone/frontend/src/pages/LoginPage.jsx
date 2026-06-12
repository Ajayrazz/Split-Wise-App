import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import useAuth from '../hooks/useAuth';
import { Layers } from 'lucide-react';

const LoginPage = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* Dynamic 3D Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Floating 3D Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl opacity-20 rotate-12 blur-[2px] animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-tr from-blue-400 to-emerald-400 rounded-full opacity-20 blur-[1px] animate-[bounce_8s_infinite]"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-bl from-purple-400 to-rose-400 rounded-xl opacity-20 -rotate-12 blur-[2px] animate-[ping_10s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
      </div>

      <div className="z-10 w-full max-w-md px-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 mb-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <Layers size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SplitwiseClone</h1>
          <p className="text-slate-400 mt-2">Welcome back! Please enter your details.</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 p-8 rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative">
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none"></div>
          
          <LoginForm />
          
          <div className="mt-6 text-center text-sm text-slate-300 relative z-20">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
