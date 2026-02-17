'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ==========================================
// 🎨 COMPONENT: THE LANDING PAGE (For Guests)
// ==========================================
function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-hidden">
      
      {/* 1. NAVBAR */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-200">
                📦
            </div>
            <span className="text-xl font-extrabold tracking-tight">ERP System</span>
        </div>
        <div className="flex gap-4">
            <button onClick={() => router.push('/login')} className="px-5 py-2 text-gray-600 font-bold hover:text-purple-600 transition">Log In</button>
            <button onClick={() => router.push('/login')} className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl hover:-translate-y-1">
                Get Started
            </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
            <div className="inline-block px-4 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-bold tracking-wide border border-purple-100 animate-pulse">
                🚀 NEW: Smart Restocking 2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-800 to-blue-900">
                Inventory Management <br/> <span className="text-purple-600">Reimagined.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
                Stop using spreadsheets. Upgrade to a powerful, real-time ERP system that tracks stock, manages orders, and secures your business data.
            </p>
            <div className="flex gap-4">
                <button onClick={() => router.push('/login')} className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-105 transition transform">
                    Start Free Trial
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition">
                    View Demo
                </button>
            </div>
            
            <div className="flex items-center gap-4 pt-4 text-sm text-gray-400 font-medium">
                <span>✅ No credit card required</span>
                <span>•</span>
                <span>✅ 14-day free trial</span>
            </div>
        </div>

        {/* Hero Image / Graphic */}
        <div className="flex-1 relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition duration-500">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">💵</div>
                    <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold">$12,450.00</p>
                    </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-3/4"></div>
                </div>
                <div className="mt-4 flex gap-2">
                    <div className="h-20 w-full bg-purple-50 rounded-lg"></div>
                    <div className="h-20 w-full bg-blue-50 rounded-lg"></div>
                </div>
            </div>
        </div>
      </header>

      {/* 3. FEATURES */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Why choose our ERP?</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: '⚡', title: 'Real-Time Sync', desc: 'Stock updates instantly across all devices when a sale is made.' },
                    { icon: '🛡️', title: 'Secure Access', desc: 'Role-based access control ensures only Admin can manage sensitive data.' },
                    { icon: '📊', title: 'Smart Analytics', desc: 'Track your best-selling items and revenue with built-in charts.' }
                ].map((f, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                        <div className="text-4xl mb-4">{f.icon}</div>
                        <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                        <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-white py-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm">© 2026 ERP Systems Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}


// ==========================================
// 📦 COMPONENT: THE DASHBOARD (For Users)
// ==========================================
function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  
  // Modals & Forms State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    // If we are in Dashboard, we assume token exists (checked by parent)
    setRole(localStorage.getItem('role') || 'staff');
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('https://inventory-system-vef6.onrender.com/api/products');
      setProducts(await res.json());
    } catch(err) { console.error(err); }
  };

  const fetchOrders = async () => {
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders');
    setOrders(await res.json());
    setIsOrderModalOpen(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('https://inventory-system-vef6.onrender.com/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newProduct),
    });
    setNewProduct({ name: '', price: '', quantity: '' });
    fetchProducts();
    alert("✨ Stock Updated!");
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !customerName || !address) return alert("Please fill details!");
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerName, address }),
    });
    if (res.ok) { alert("🚀 Order Placed!"); setCart([]); setCustomerName(''); setAddress(''); fetchProducts(); }
  };

  const handleChangePassword = async () => {
    const email = prompt("Confirm your email:");
    if (!email) return;
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...passwordForm }),
    });
    if (res.ok) { alert("🔒 Password Updated!"); setIsPasswordModalOpen(false); }
    else { alert("❌ Failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col p-6 shadow-sm z-10">
        <div className="mb-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">📦</div>
            <span className="font-extrabold text-xl tracking-tight">ERP System</span>
        </div>
        <nav className="flex-1 space-y-2">
            <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-bold flex items-center gap-3 cursor-pointer"><span>🏠</span> Dashboard</div>
            {role === 'admin' && (
                <div onClick={fetchOrders} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition"><span>📊</span> Sales History</div>
            )}
            <div onClick={() => setIsPasswordModalOpen(true)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition"><span>🔑</span> Security</div>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-100">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full py-2 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition">Log Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
            <div><h1 className="text-3xl font-bold text-gray-800">Inventory Overview</h1><p className="text-gray-500 mt-1">Welcome back, {role.toUpperCase()}</p></div>
        </header>

        {role === 'admin' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Add / Restock</h3>
                <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4">
                    <input placeholder="Product Name" className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct, name: e.target.value})} />
                    <input placeholder="Price" type="number" className="w-32 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={newProduct.price} onChange={(e)=>setNewProduct({...newProduct, price: e.target.value})} />
                    <input placeholder="Qty" type="number" className="w-24 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={newProduct.quantity} onChange={(e)=>setNewProduct({...newProduct, quantity: e.target.value})} />
                    <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">+ Add</button>
                </form>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
                <div key={p._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between h-48 group">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-600 transition">{p.name}</h3>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">${p.price}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">SKU: {p.sku?.split('-')[1] || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                         <div className={`px-3 py-1 rounded-lg text-xs font-bold ${p.quantity < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{p.quantity} in Stock</div>
                        {role !== 'admin' && <button onClick={() => setCart([...cart, p])} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">+</button>}
                    </div>
                </div>
            ))}
        </div>
      </main>

      {/* CART (Staff Only) */}
      {role !== 'admin' && (
        <aside className="w-full md:w-80 bg-white border-l border-gray-200 p-6 shadow-xl flex flex-col h-screen sticky top-0">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">🛒 Current Order</h2>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {cart.length === 0 ? <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Cart is empty</div> : cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100"><span className="text-sm font-medium">{item.name}</span><span className="text-sm font-bold text-gray-600">${item.price}</span></div>
                ))}
            </div>
            <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>${cart.reduce((sum, item) => sum + item.price, 0)}</span></div>
                <div className="space-y-3">
                    <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none resize-none" placeholder="Address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <button onClick={handleCheckout} disabled={cart.length === 0} className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${cart.length===0 ? 'bg-gray-300' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>Confirm Order</button>
            </div>
        </aside>
      )}

      {/* SALES HISTORY MODAL */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg">📂 Transaction History</h3>
                    <button onClick={() => setIsOrderModalOpen(false)} className="w-8 h-8 rounded-full bg-white text-gray-500 hover:text-red-500 flex items-center justify-center font-bold">✕</button>
                </div>
                <div className="overflow-y-auto p-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500"><tr><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3 text-right">Total</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">{orders.map((o) => (<tr key={o._id} className="hover:bg-gray-50 transition"><td className="p-3 text-gray-500">{new Date(o.date).toLocaleDateString()}</td><td className="p-3 font-medium">{o.customerName}</td><td className="p-3 text-gray-600">{o.items.map((i:any) => i.name).join(', ')}</td><td className="p-3 text-right font-bold text-green-600">${o.total}</td></tr>))}</tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-center">Change Password</h2>
                <div className="space-y-4">
                    <input type="password" placeholder="Old Password" className="w-full border bg-gray-50 p-3 rounded-xl outline-none" onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} />
                    <input type="password" placeholder="New Password" className="w-full border bg-gray-50 p-3 rounded-xl outline-none" onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                    <button onClick={handleChangePassword} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">Update</button>
                    <button onClick={() => setIsPasswordModalOpen(false)} className="w-full text-gray-400 text-sm hover:text-gray-600">Cancel</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}


// ==========================================
// 🚀 MAIN PAGE: THE SMART SWITCHER
// ==========================================
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setChecking(false);
  }, []);

  if (checking) return null; // Avoid flicker

  // IF LOGGED IN -> Show Dashboard
  if (isLoggedIn) {
    return <Dashboard />;
  }

  // IF GUEST -> Show Landing Page
  return <LandingPage />;
}