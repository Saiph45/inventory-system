'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isResetMode, setIsResetMode] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', newPassword: '', secretKey: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = isResetMode 
        ? 'https://inventory-system-vef6.onrender.com/api/auth/reset-password'
        : 'https://inventory-system-vef6.onrender.com/api/auth/login';
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        if (!isResetMode) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            router.push('/'); 
        } else {
            alert("✅ Password Reset! Please login.");
            setIsResetMode(false);
        }
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) { alert("❌ Connection Error"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01]">
        
        <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text text-4xl font-extrabold mb-2">
                📦 ERP System
            </div>
            <p className="text-gray-500 text-sm">Manage your inventory with style</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {!isResetMode ? (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                        <input name="email" type="email" required placeholder="admin@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50"
                            onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                        <input name="password" type="password" required placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50"
                            onChange={handleChange} />
                    </div>
                </>
            ) : (
                <>
                   <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 mb-4">
                        ℹ️ Enter your email, new password, and the <strong>Master Key</strong> to reset.
                   </div>
                   <input name="email" type="email" required placeholder="Your Email" className="w-full px-4 py-3 rounded-xl border bg-gray-50" onChange={handleChange} />
                   <input name="newPassword" type="password" required placeholder="New Password" className="w-full px-4 py-3 rounded-xl border bg-gray-50" onChange={handleChange} />
                   <input name="secretKey" type="text" required placeholder="Master Key" className="w-full px-4 py-3 rounded-xl border bg-gray-50" onChange={handleChange} />
                </>
            )}

            <button disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 active:translate-y-0">
                {loading ? 'Processing...' : (isResetMode ? 'Reset Password' : 'Sign In')}
            </button>
        </form>

        <div className="mt-6 text-center">
            <button onClick={() => setIsResetMode(!isResetMode)} className="text-sm text-gray-500 hover:text-purple-600 font-semibold transition">
                {isResetMode ? '← Back to Login' : 'Forgot Password?'}
            </button>
        </div>
      </div>
    </div>
  );
}