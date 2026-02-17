'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // View State: 'login' | 'signup' | 'reset'
  const [view, setView] = useState('login'); 
  const [formData, setFormData] = useState({ 
      name: '', email: '', password: '', confirmPassword: '', newPassword: '', secretKey: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // ✅ VALIDATION: Check Passwords Match
    if (view === 'signup' && formData.password !== formData.confirmPassword) {
        alert("❌ Passwords do not match!");
        setLoading(false);
        return;
    }

    let url = '';
    if (view === 'login') url = 'https://inventory-system-vef6.onrender.com/api/auth/login';
    if (view === 'signup') url = 'https://inventory-system-vef6.onrender.com/api/auth/register';
    if (view === 'reset') url = 'https://inventory-system-vef6.onrender.com/api/auth/reset-password';
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        if (view === 'login') {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userName', data.name); // Save Name
            router.push('/'); 
        } else if (view === 'signup') {
            alert("✅ Account Created! Please Sign In.");
            setView('login');
        } else {
            alert("✅ Password Reset! Please Sign In.");
            setView('login');
        }
      } else {
        alert("❌ Error: " + (data.error || data.message));
      }
    } catch (err) { alert("❌ Connection Error"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01]">
        
        {/* HEADER */}
        <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text text-4xl font-extrabold mb-2">
                {view === 'login' && '📦 Welcome Back'}
                {view === 'signup' && '🚀 Join Us'}
                {view === 'reset' && '🔐 Recovery'}
            </div>
            <p className="text-gray-500 text-sm">
                {view === 'login' && 'Sign in to manage your inventory'}
                {view === 'signup' && 'Create your staff account'}
                {view === 'reset' && 'Reset your access securely'}
            </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ✅ NEW: Name Field (Only for Signup) */}
            {view === 'signup' && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 ml-1 uppercase">Full Name</label>
                    <input name="name" type="text" required placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50"
                        onChange={handleChange} />
                </div>
            )}

            {/* Email Field (Always Visible) */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 ml-1 uppercase">Email Address</label>
                <input name="email" type="email" required placeholder="name@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50"
                    onChange={handleChange} />
            </div>

            {/* Password Field (Login & Signup) */}
            {(view === 'login' || view === 'signup') && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 ml-1 uppercase">Password</label>
                    <input name="password" type="password" required placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50"
                        onChange={handleChange} />
                </div>
            )}

            {/* ✅ NEW: Confirm Password (Only for Signup) */}
            {view === 'signup' && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 ml-1 uppercase">Confirm Password</label>
                    <input name="confirmPassword" type="password" required placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50"
                        onChange={handleChange} />
                </div>
            )}

            {/* Reset Password Fields */}
            {view === 'reset' && (
                <>
                   <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 mb-2">
                        ℹ️ Enter the <strong>Master Key</strong> to reset.
                   </div>
                   <input name="newPassword" type="password" required placeholder="New Password" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none" onChange={handleChange} />
                   <input name="secretKey" type="text" required placeholder="Master Key" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none" onChange={handleChange} />
                </>
            )}

            {/* Main Action Button */}
            <button disabled={loading} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 active:translate-y-0">
                {loading ? 'Processing...' : (
                    view === 'login' ? 'Sign In' : (view === 'signup' ? 'Create Account' : 'Reset Password')
                )}
            </button>
        </form>

        {/* FOOTER LINKS */}
        <div className="mt-6 text-center space-y-2">
            {view === 'login' && (
                <>
                    <p className="text-sm text-gray-500">
                        New here? <button onClick={() => setView('signup')} className="text-purple-600 font-bold hover:underline">Create Account</button>
                    </p>
                    <button onClick={() => setView('reset')} className="text-xs text-gray-400 hover:text-gray-600">
                        Forgot Password?
                    </button>
                </>
            )}

            {(view === 'signup' || view === 'reset') && (
                <button onClick={() => setView('login')} className="text-sm text-gray-500 hover:text-purple-600 font-semibold transition">
                    ← Back to Login
                </button>
            )}
        </div>

      </div>
    </div>
  );
}