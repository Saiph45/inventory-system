'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Forms
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setRole(localStorage.getItem('role') || 'staff');
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('https://inventory-system-vef6.onrender.com/api/products');
      setProducts(await res.json());
      setLoading(false);
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
    if (cart.length === 0 || !customerName || !address) return alert("Please fill in all details!");
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerName, address }),
    });
    if (res.ok) { alert("🚀 Order Placed Successfully!"); setCart([]); setCustomerName(''); setAddress(''); fetchProducts(); }
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
    else { alert("❌ Failed to update password"); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-600 font-bold text-xl animate-pulse">Loading Inventory...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* 1. SIDEBAR (Navigation) */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col p-6 shadow-sm z-10">
        <div className="mb-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">📦</div>
            <span className="font-extrabold text-xl tracking-tight text-gray-800">ERP System</span>
        </div>

        <nav className="flex-1 space-y-2">
            <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-bold flex items-center gap-3 cursor-pointer">
                <span>🏠</span> Dashboard
            </div>
            {role === 'admin' && (
                <div onClick={fetchOrders} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition">
                    <span>📊</span> Sales History
                </div>
            )}
            <div onClick={() => setIsPasswordModalOpen(true)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition">
                <span>🔑</span> Security
            </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {role.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-700 capitalize">{role}</p>
                    <p className="text-xs text-gray-400">Online</p>
                </div>
            </div>
            <button onClick={() => {localStorage.clear(); router.push('/login');}} className="w-full py-2 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition">
                Log Out
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Inventory Overview</h1>
                <p className="text-gray-500 mt-1">Manage stock and track orders efficiently.</p>
            </div>
            <div className="hidden md:block bg-white px-4 py-2 rounded-full shadow-sm text-sm text-gray-500 border border-gray-100">
                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </header>

        {/* ADMIN: Add Product Form */}
        {role === 'admin' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Add / Restock</h3>
                <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4">
                    <input placeholder="Product Name" className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-200 outline-none" 
                        value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct, name: e.target.value})} />
                    <input placeholder="Price" type="number" className="w-32 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" 
                        value={newProduct.price} onChange={(e)=>setNewProduct({...newProduct, price: e.target.value})} />
                    <input placeholder="Qty" type="number" className="w-24 bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none" 
                        value={newProduct.quantity} onChange={(e)=>setNewProduct({...newProduct, quantity: e.target.value})} />
                    <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200">
                        + Add Item
                    </button>
                </form>
            </div>
        )}

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
                <div key={p._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between h-48 group">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-600 transition">{p.name}</h3>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                                ${p.price}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">SKU: {p.sku?.split('-')[1] || 'N/A'}</p>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                         <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                             p.quantity < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                         }`}>
                            {p.quantity} in Stock
                        </div>
                        {role !== 'admin' && (
                            <button onClick={() => setCart([...cart, p])} className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                                +
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </main>

      {/* 3. STAFF CART SIDEBAR (Right Side) */}
      {role !== 'admin' && (
        <aside className="w-full md:w-80 bg-white border-l border-gray-200 p-6 shadow-xl flex flex-col h-screen sticky top-0">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">🛒 Current Order</h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                {cart.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                        Cart is empty
                    </div>
                ) : (
                    cart.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-sm font-bold text-gray-600">${item.price}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cart.reduce((sum, item) => sum + item.price, 0)}</span>
                </div>

                <div className="space-y-3">
                    <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" 
                        placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none" 
                        placeholder="Delivery Address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <button onClick={handleCheckout} disabled={cart.length === 0} 
                    className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${cart.length===0 ? 'bg-gray-300 shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200 hover:-translate-y-1'}`}>
                    Confirm Order
                </button>
            </div>
        </aside>
      )}

      {/* MODALS (Sales History & Password) */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg">📂 Transaction History</h3>
                    <button onClick={() => setIsOrderModalOpen(false)} className="w-8 h-8 rounded-full bg-white text-gray-500 hover:text-red-500 flex items-center justify-center font-bold">✕</button>
                </div>
                <div className="overflow-y-auto p-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-3 rounded-l-lg">Date</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Items</th>
                                <th className="p-3 text-right rounded-r-lg">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((o) => (
                                <tr key={o._id} className="hover:bg-gray-50 transition">
                                    <td className="p-3 text-gray-500">{new Date(o.date).toLocaleDateString()}</td>
                                    <td className="p-3 font-medium text-gray-800">{o.customerName}<div className="text-xs font-normal text-gray-400">{o.address}</div></td>
                                    <td className="p-3 text-gray-600">{o.items.map((i:any) => i.name).join(', ')}</td>
                                    <td className="p-3 text-right font-bold text-green-600">${o.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-center">Change Password</h2>
                <div className="space-y-4">
                    <input type="password" placeholder="Old Password" className="w-full border bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-100" onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} />
                    <input type="password" placeholder="New Password" className="w-full border bg-gray-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-100" onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                    <button onClick={handleChangePassword} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">Update Security</button>
                    <button onClick={() => setIsPasswordModalOpen(false)} className="w-full text-gray-400 text-sm hover:text-gray-600">Cancel</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}