'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ==========================================
// 🎨 COMPONENT: LANDING PAGE (Guest)
// ==========================================
function LandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-hidden relative selection:bg-purple-100">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200 animate-bounce-slow">📦</div>
            <span className="text-2xl font-black tracking-tighter text-gray-800">ERP<span className="text-purple-600">Pro</span></span>
        </div>
        <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Login / Join
        </button>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 space-y-8 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900">
                Master Your <br/> <span className="text-indigo-600">Inventory.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
                The modern ERP system for fast-moving teams. Track stock, manage sales, and analyze growth in real-time.
            </p>
            <div className="flex gap-4">
                <button onClick={() => router.push('/login')} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-105 transition transform">
                    Get Started Now
                </button>
            </div>
        </div>
        
        {/* Animated Graphic */}
        <div className="flex-1 relative w-full flex justify-center">
            <div className="absolute top-0 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-8 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="relative bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition duration-500 w-80">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-3 w-24 bg-gray-200 rounded-full"></div>
                    <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">↑</div>
                </div>
                <div className="space-y-4">
                    <div className="h-20 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
                         <div className="h-2 w-12 bg-indigo-200 rounded-full mb-2"></div>
                         <div className="h-2 w-24 bg-indigo-100 rounded-full"></div>
                    </div>
                     <div className="h-20 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                         <div className="h-2 w-12 bg-gray-200 rounded-full mb-2"></div>
                         <div className="h-2 w-20 bg-gray-100 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
      </header>
    </div>
  );
}

// ==========================================
// 📦 COMPONENT: DASHBOARD (Logged In)
// ==========================================
function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState('inventory');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Forms
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
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
    alert("✨ Stock Updated Successfully!");
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !customerName || !address) return alert("Please fill all details!");
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerName, address }),
    });
    if (res.ok) { 
        alert("🚀 Order Placed!"); 
        setCart([]); setCustomerName(''); setAddress(''); 
        fetchProducts(); 
    }
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

  // Calculations for Stats Cards
  const totalStock = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const lowStockItems = products.filter(p => p.quantity < 5).length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* 1. SIDEBAR */}
      <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between sticky top-0 h-screen z-20 transition-all duration-300">
        <div>
            <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-100">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">📦</div>
                <span className="hidden md:block ml-3 font-extrabold text-lg tracking-tight">ERP<span className="text-indigo-600">Pro</span></span>
            </div>

            <nav className="p-4 space-y-2">
                <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <span className="text-xl">🏠</span>
                    <span className="hidden md:block ml-3 font-bold text-sm">Overview</span>
                </button>
                {role === 'admin' && (
                    <button onClick={fetchOrders} className="w-full flex items-center p-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
                        <span className="text-xl">📊</span>
                        <span className="hidden md:block ml-3 font-bold text-sm">Sales History</span>
                    </button>
                )}
                 <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center p-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
                    <span className="text-xl">🔐</span>
                    <span className="hidden md:block ml-3 font-bold text-sm">Security</span>
                </button>
            </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full flex items-center justify-center md:justify-start p-3 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-all font-bold text-sm">
                <span>🚪</span>
                <span className="hidden md:block ml-3">Logout</span>
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* HEADER & WELCOME */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, <span className="text-indigo-600 font-bold capitalize">{role}</span></p>
            </div>
            <div className="bg-white px-5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-500 shadow-sm">
                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
        </header>

        {/* STATS CARDS (Top Row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200 transform hover:scale-[1.02] transition-all">
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Inventory Value</p>
                <h3 className="text-3xl font-bold">${totalValue.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wide mb-1">Total Items</p>
                <h3 className="text-3xl font-bold text-gray-800">{totalStock} <span className="text-sm text-gray-400 font-normal">units</span></h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-2 ${lowStockItems > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} rounded-bl-xl font-bold text-xs`}>
                    {lowStockItems > 0 ? 'Action Needed' : 'Healthy'}
                </div>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wide mb-1">Low Stock Alerts</p>
                <h3 className={`text-3xl font-bold ${lowStockItems > 0 ? 'text-red-500' : 'text-green-500'}`}>{lowStockItems}</h3>
            </div>
        </div>

        {/* ADMIN: ADD PRODUCT */}
        {role === 'admin' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                    <h3 className="font-bold text-gray-800">Quick Restock / Add Item</h3>
                </div>
                <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4">
                    <input placeholder="Product Name (e.g. iPhone 15)" className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none transition-all" value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct, name: e.target.value})} />
                    <input placeholder="Price ($)" type="number" className="w-full md:w-32 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={newProduct.price} onChange={(e)=>setNewProduct({...newProduct, price: e.target.value})} />
                    <input placeholder="Qty" type="number" className="w-full md:w-24 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={newProduct.quantity} onChange={(e)=>setNewProduct({...newProduct, quantity: e.target.value})} />
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200">
                        + Update
                    </button>
                </form>
            </div>
        )}

        {/* INVENTORY GRID */}
        <h3 className="font-bold text-gray-800 mb-6 text-xl">Current Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {products.map((p, index) => (
                <div key={p._id} 
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-52 group relative overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-bl-full -mr-4 -mt-4 group-hover:bg-indigo-50 transition-colors"></div>

                    <div>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition">{p.name}</h3>
                            <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                                ${p.price}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono">SKU: {p.sku ? p.sku.split('-')[1] : 'N/A'}</p>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4 relative z-10">
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                             p.quantity < 5 
                             ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                             : 'bg-green-50 text-green-600 border-green-100'
                         }`}>
                            <div className={`w-2 h-2 rounded-full ${p.quantity < 5 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            {p.quantity} Units
                        </div>
                        
                        {role !== 'admin' && (
                            <button onClick={() => setCart([...cart, p])} className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition shadow-sm">
                                +
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </main>

      {/* 3. CART SIDEBAR (Floating) */}
      {role !== 'admin' && (
        <aside className="w-80 bg-white border-l border-gray-200 p-6 shadow-2xl flex flex-col h-screen sticky top-0 z-30">
            <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2 text-gray-800">
                🛒 New Order <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full ml-auto">{cart.length} items</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
                {cart.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50">
                        <span className="text-2xl mb-2">🛍️</span>
                        <p className="text-gray-400 text-sm font-medium">Cart is empty</p>
                    </div>
                ) : (
                    cart.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fade-in-right">
                            <span className="text-sm font-bold text-gray-700">{item.name}</span>
                            <span className="text-xs font-bold text-gray-400">${item.price}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between text-lg font-black text-gray-800">
                    <span>Total</span>
                    <span>${cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}</span>
                </div>

                <div className="space-y-3">
                    <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                        placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                        placeholder="Delivery Address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <button onClick={handleCheckout} disabled={cart.length === 0} 
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg transform active:scale-95 ${
                        cart.length===0 ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200 hover:-translate-y-1'
                    }`}>
                    Confirm Order
                </button>
            </div>
        </aside>
      )}

      {/* MODALS */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">📂 Sales History</h3>
                    <button onClick={() => setIsOrderModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center font-bold">✕</button>
                </div>
                <div className="overflow-y-auto p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-400 font-medium uppercase tracking-wider text-xs">
                            <tr>
                                <th className="p-4 pl-6">Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4 pr-6 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((o) => (
                                <tr key={o._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6 text-gray-500 font-mono text-xs">{new Date(o.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold text-gray-800">{o.customerName}<div className="text-xs font-normal text-gray-400 truncate max-w-[150px]">{o.address}</div></td>
                                    <td className="p-4 text-gray-600">{o.items.map((i:any) => i.name).join(', ')}</td>
                                    <td className="p-4 pr-6 text-right font-bold text-green-600">${o.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 border border-gray-100 animate-scale-up">
                <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Update Security</h2>
                <div className="space-y-4">
                    <input type="password" placeholder="Old Password" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all" onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} />
                    <input type="password" placeholder="New Password" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all" onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                    <button onClick={handleChangePassword} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition transform active:scale-95">Confirm Change</button>
                    <button onClick={() => setIsPasswordModalOpen(false)} className="w-full text-gray-400 text-sm hover:text-gray-600 font-medium py-2">Cancel</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 🚀 MAIN PAGE SWITCHER
// ==========================================
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setChecking(false);
  }, []);

  if (checking) return null;
  return isLoggedIn ? <Dashboard /> : <LandingPage />;
}