import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await login(email, password);
    } catch (err) {
      if (err.response?.data?.error?.fields) {
        setErrors(err.response.data.error.fields);
      } else {
        setErrors({ non_field_errors: ['Invalid email or password.'] });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
      <h2 className="text-2xl font-bold text-center text-slate-800">Login</h2>
      {errors.non_field_errors && (
        <div className="text-sm text-rose-600 bg-rose-50 p-2 rounded">{errors.non_field_errors[0]}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          className="mt-1 block w-full rounded border border-slate-300 p-2" 
          required 
        />
        {errors.email && <span className="text-xs text-rose-500">{errors.email[0]}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          className="mt-1 block w-full rounded border border-slate-300 p-2" 
          required 
        />
        {errors.password && <span className="text-xs text-rose-500">{errors.password[0]}</span>}
      </div>
      <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition-colors">Sign In</button>
    </form>
  );
};

export default LoginForm;
