'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// 📊 CHART.JS IMPORTS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// ==========================================
// 🎨 LANDING PAGE (Guest View)
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
        <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">Login / Join</button>
      </nav>

      <header className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 space-y-8 animate-fade-in-up">
            {/* ✅ UPDATED BADGE TEXT */}
            <div className="inline-block px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold tracking-wide border border-indigo-100 shadow-sm">
                🚀 Version 2.0 Live: Analytics & Bulk Upload
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900">
                Data Driven <br/> <span className="text-indigo-600">Inventory.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
                Manage stock, bulk upload data, and visualize sales with our advanced ERP dashboard.
            </p>
            <button onClick={() => router.push('/login')} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-105 transition transform">Access Dashboard</button>
        </div>
        <div className="flex-1 relative w-full flex justify-center">
            <div className="w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-20 absolute"></div>
            <div className="relative bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 rotate-3 hover:rotate-0 transition duration-500">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">🚀</div>
                    <div><p className="text-xs text-gray-400 uppercase font-bold">System Status</p><p className="text-xl font-bold text-gray-800">Production Ready</p></div>
                </div>
                <div className="h-24 w-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">All Systems Go</div>
            </div>
        </div>
      </header>
    </div>
  );
}

// ==========================================
// 📦 DASHBOARD (Logged In View)
// ==========================================
function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('inventory');
  
  // External API Data
  const [quote, setQuote] = useState({ content: "Loading...", author: "" });

  // Modals & Forms
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    setRole(localStorage.getItem('role') || 'staff');
    fetchProducts();
    if(localStorage.getItem('role') !== 'staff') fetchOrders(); 
    
    // ✅ EXTERNAL API INTEGRATION: Fetch Random Quote
    fetch('https://api.quotable.io/random?tags=business|success')
        .then(res => res.json())
        .then(data => setQuote(data))
        .catch(() => setQuote({ content: "Growth is the only evidence of life.", author: "Newman" }));
  }, []);

  const fetchProducts = async () => {
    try { const res = await fetch('https://inventory-system-vef6.onrender.com/api/products'); setProducts(await res.json()); } catch(err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try { const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders'); setOrders(await res.json()); } catch(err) {}
  };

  // ✅ BULK UPLOAD HANDLER
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target?.result as string;
        // Parse CSV: Assume format Name,Price,Quantity
        const rows = text.split('\n').slice(1); // Skip header
        const bulkData = rows.map(row => {
            const [name, price, quantity] = row.split(',');
            return { name: name?.trim(), price: Number(price), quantity: Number(quantity) };
        }).filter(item => item.name);

        if (bulkData.length === 0) return alert("❌ Empty or invalid CSV");

        const token = localStorage.getItem('token');
        const res = await fetch('https://inventory-system-vef6.onrender.com/api/products/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(bulkData)
        });
        const data = await res.json();
        if (res.ok) { alert("✅ " + data.message); fetchProducts(); } else { alert("❌ Upload Failed"); }
    };
    reader.readAsText(file);
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
    if (cart.length === 0 || !customerName || !address) return alert("Please fill all details!");
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerName, address }),
    });
    if (res.ok) { alert("🚀 Order Placed!"); setCart([]); setCustomerName(''); setAddress(''); fetchProducts(); fetchOrders(); }
  };

  const handleChangePassword = async () => {
    const email = prompt("Confirm your email:");
    if (!email) return;
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/auth/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, ...passwordForm }),
    });
    if (res.ok) { alert("🔒 Password Updated!"); setIsPasswordModalOpen(false); } else { alert("❌ Failed"); }
  };

  const downloadCSV = () => {
    const headers = ["Date,Customer Name,Address,Items,Total Price"];
    const rows = orders.map(o => `${new Date(o.date).toLocaleDateString()},"${o.customerName}","${o.address}","${o.items.map((i:any) => i.name).join(' | ')}",${o.total}`);
    const link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + [headers, ...rows].join("\n"));
    link.download = "sales_report.csv";
    document.body.appendChild(link);
    link.click();
  };

  // Charts & Calculations
  const totalStock = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  
  // ✅ FIX: Force price and quantity to be numbers (Prevents $NaN error)
  const totalValue = products.reduce((acc, p) => acc + ((Number(p.price) || 0) * (Number(p.quantity) || 0)), 0);

  const lowStockItems = products.filter(p => p.quantity < 5).length;
  
  const stockChartData = {
    labels: products.slice(0, 8).map(p => p.name),
    datasets: [{ label: 'Stock Level', data: products.slice(0, 8).map(p => p.quantity), backgroundColor: 'rgba(99, 102, 241, 0.6)' }]
  };
  const pieChartData = {
    labels: ['Premium', 'Budget'],
    datasets: [{ data: [products.filter(p=>p.price>500).length, products.filter(p=>p.price<=500).length], backgroundColor: ['#8b5cf6', '#ec4899'] }]
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between sticky top-0 h-screen z-20">
        <div>
            <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-100">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">📦</div>
                <span className="hidden md:block ml-3 font-extrabold text-lg tracking-tight">ERP<span className="text-indigo-600">Pro</span></span>
            </div>
            <nav className="p-4 space-y-2">
                <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <span className="text-xl">🏠</span><span className="hidden md:block ml-3 font-bold text-sm">Overview</span>
                </button>
                {/* ADMIN & MANAGER can see Reports */}
                {(role === 'admin' || role === 'manager') && (
                    <button onClick={() => { setIsOrderModalOpen(true); fetchOrders(); }} className="w-full flex items-center p-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
                        <span className="text-xl">📊</span><span className="hidden md:block ml-3 font-bold text-sm">Reports</span>
                    </button>
                )}
                 <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center p-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-all">
                    <span className="text-xl">🔐</span><span className="hidden md:block ml-3 font-bold text-sm">Security</span>
                </button>
            </nav>
        </div>
        
        {/* EXTERNAL API WIDGET */}
        <div className="hidden md:block px-4 pb-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 text-xs">
                <p className="font-bold text-indigo-800 mb-1">💡 Daily Wisdom</p>
                <p className="text-gray-600 italic">"{quote.content}"</p>
            </div>
        </div>

        <div className="p-4 border-t border-gray-100">
            <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full flex items-center justify-center md:justify-start p-3 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-all font-bold text-sm">
                <span>🚪</span><span className="hidden md:block ml-3">Logout</span>
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, <span className="text-indigo-600 font-bold capitalize">{role}</span></p>
            </div>
            <div className="bg-white px-5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-500 shadow-sm">
                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200 transform hover:scale-[1.02] transition-all">
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Inventory Value</p>
                <h3 className="text-3xl font-bold">${totalValue.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wide mb-1">Total Items</p>
                <h3 className="text-3xl font-bold text-gray-800">{totalStock}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wide mb-1">Low Stock Alerts</p>
                <h3 className={`text-3xl font-bold ${lowStockItems > 0 ? 'text-red-500' : 'text-green-500'}`}>{lowStockItems}</h3>
            </div>
        </div>

        {/* ANALYTICS (Admin & Manager) */}
        {(role === 'admin' || role === 'manager') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Stock Levels</h3>
                    <div className="h-64 flex items-center justify-center"><Bar data={stockChartData} options={{ maintainAspectRatio: false }} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Pricing Mix</h3>
                    <div className="h-64 flex items-center justify-center"><Doughnut data={pieChartData} options={{ maintainAspectRatio: false }} /></div>
                </div>
            </div>
        )}

        {/* ADD PRODUCT & BULK UPLOAD (Admin ONLY) */}
        {role === 'admin' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Quick Restock / Add Item</h3>
                    {/* 📂 BULK UPLOAD BUTTON */}
                    <div className="relative">
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-200 transition">📂 Bulk Upload CSV</button>
                    </div>
                </div>
                <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4">
                    <input placeholder="Product Name" className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct, name: e.target.value})} />
                    <input placeholder="Price" type="number" className="w-full md:w-32 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={newProduct.price} onChange={(e)=>setNewProduct({...newProduct, price: e.target.value})} />
                    <input placeholder="Qty" type="number" className="w-full md:w-24 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" value={newProduct.quantity} onChange={(e)=>setNewProduct({...newProduct, quantity: e.target.value})} />
                    <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition">+ Update</button>
                </form>
            </div>
        )}

        {/* INVENTORY LIST */}
        <h3 className="font-bold text-gray-800 mb-6 text-xl">Current Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {products.map((p) => (
                <div key={p._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-52 group">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                            <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold">${p.price}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono">SKU: {p.sku?.split('-')[1] || 'N/A'}</p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${p.quantity<5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                            {p.quantity} Units
                        </div>
                        {role === 'staff' && <button onClick={() => setCart([...cart, p])} className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition">+</button>}
                    </div>
                </div>
            ))}
        </div>
      </main>
      
      {/* (Cart Sidebar & Modals... kept exactly as before) */}
      {role === 'staff' && (
        <aside className="w-80 bg-white border-l border-gray-200 p-6 shadow-2xl flex flex-col h-screen sticky top-0 z-30">
            <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2 text-gray-800">🛒 Order <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full ml-auto">{cart.length} items</span></h2>
            <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
                {cart.map((item, i) => <div key={i} className="flex justify-between bg-white p-3 rounded-xl border border-gray-100"><span className="text-sm font-bold">{item.name}</span><span className="text-xs font-bold">${item.price}</span></div>)}
            </div>
            <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between text-lg font-black"><span>Total</span><span>${cart.reduce((sum, item) => sum + item.price, 0)}</span></div>
                <input className="w-full bg-gray-50 border p-3 rounded-xl text-sm" placeholder="Customer Name" value={customerName} onChange={(e)=>setCustomerName(e.target.value)} />
                <textarea className="w-full bg-gray-50 border p-3 rounded-xl text-sm" placeholder="Address" rows={2} value={address} onChange={(e)=>setAddress(e.target.value)} />
                <button onClick={handleCheckout} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">Confirm Order</button>
            </div>
        </aside>
      )}

      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">📂 Sales Reports</h3>
                    <div className="flex gap-2">
                        <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">📥 Export CSV</button>
                        <button onClick={() => setIsOrderModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 font-bold">✕</button>
                    </div>
                </div>
                <div className="overflow-y-auto p-0">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-400 font-medium uppercase text-xs"><tr><th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Total</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">{orders.map(o => <tr key={o._id}><td className="p-4">{new Date(o.date).toLocaleDateString()}</td><td className="p-4 font-bold">{o.customerName}</td><td className="p-4 font-bold text-green-600">${o.total}</td></tr>)}</tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* Security Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-center">Security</h2>
                <div className="space-y-4">
                    <input type="password" placeholder="Old Password" className="w-full border bg-gray-50 p-4 rounded-xl" onChange={(e)=>setPasswordForm({...passwordForm, oldPassword: e.target.value})} />
                    <input type="password" placeholder="New Password" className="w-full border bg-gray-50 p-4 rounded-xl" onChange={(e)=>setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                    <button onClick={handleChangePassword} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold">Update</button>
                    <button onClick={()=>setIsPasswordModalOpen(false)} className="w-full text-gray-400 text-sm">Cancel</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => { const token = localStorage.getItem('token'); setIsLoggedIn(!!token); setChecking(false); }, []);
  if (checking) return null;
  return isLoggedIn ? <Dashboard /> : <LandingPage />;
}