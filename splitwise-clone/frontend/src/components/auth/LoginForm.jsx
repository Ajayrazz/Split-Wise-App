import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err.response?.data?.error?.fields) {
        setErrors(err.response.data.error.fields);
      } else {
        setErrors({ non_field_errors: ['Invalid email or password.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 relative z-20">
      {errors.non_field_errors && (
        <div className="text-sm text-rose-200 bg-rose-500/20 border border-rose-500/50 p-3 rounded-xl flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
          {errors.non_field_errors[0]}
        </div>
      )}
      
      <div className="space-y-1 text-left">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
            <Mail size={18} />
          </div>
          <input 
            type="email" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner" 
            placeholder="you@example.com"
            required 
          />
        </div>
        {errors.email && <span className="text-xs text-rose-400 ml-1">{errors.email[0]}</span>}
      </div>

      <div className="space-y-1 text-left">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
            <Lock size={18} />
          </div>
          <input 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner" 
            placeholder="••••••••"
            required 
          />
        </div>
        {errors.password && <span className="text-xs text-rose-400 ml-1">{errors.password[0]}</span>}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group mt-8 disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
        {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
      </button>
    </form>
  );
};

export default LoginForm;
