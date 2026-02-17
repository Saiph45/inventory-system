'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const router = useRouter();

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Forms State
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });

  // Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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
      const data = await res.json();
      setProducts(data);
    } catch(err) { console.error(err); }
  };

  // ✅ NEW: Fetch Orders for Admin
  const fetchOrders = async () => {
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders');
    const data = await res.json();
    setOrders(data);
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
    alert("✅ Product Updated!");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmEmail = prompt("Confirm your email:");
    if (!confirmEmail) return;
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: confirmEmail, ...passwordForm }),
    });
    if (res.ok) { alert("✅ Password Changed!"); setIsPasswordModalOpen(false); }
    else { alert("❌ Failed"); }
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !customerName || !address) return alert("Fill all details!");
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerName, address }),
    });
    if (res.ok) { alert("✅ Order Placed!"); setCart([]); setCustomerName(''); setAddress(''); fetchProducts(); }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50 flex gap-8">
      
      <div className="flex-1">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">📦 Inventory</h1>
                <p className="text-gray-500 text-sm">Role: {role.toUpperCase()}</p>
            </div>
            <div className="flex gap-2">
                {role === 'admin' && (
                    <button onClick={fetchOrders} className="bg-purple-600 text-white px-3 py-1 rounded font-bold hover:bg-purple-700">
                        📊 View Sales
                    </button>
                )}
                <button onClick={() => setIsPasswordModalOpen(true)} className="text-blue-600 font-bold border px-3 py-1 rounded">🔑 Pass</button>
                <button onClick={handleLogout} className="text-red-500 font-bold border px-3 py-1 rounded">Logout</button>
            </div>
        </div>

        {/* ADMIN ADD PRODUCT FORM */}
        {role === 'admin' && (
            <form onSubmit={handleAddProduct} className="bg-white p-4 rounded shadow mb-6 flex gap-2">
                <input placeholder="Name" className="border p-2 rounded w-full" value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct, name: e.target.value})} />
                <input placeholder="Price" className="border p-2 rounded w-20" value={newProduct.price} onChange={(e)=>setNewProduct({...newProduct, price: e.target.value})} />
                <input placeholder="Qty" className="border p-2 rounded w-20" value={newProduct.quantity} onChange={(e)=>setNewProduct({...newProduct, quantity: e.target.value})} />
                <button className="bg-green-600 text-white px-4 rounded font-bold">+</button>
            </form>
        )}

        {/* PRODUCT LIST */}
        <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
                <div key={p._id} className="bg-white p-4 rounded shadow flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold">{p.name}</h3>
                        <p className="text-sm text-gray-500">${p.price}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${p.quantity < 5 ? 'bg-red-100' : 'bg-green-100'}`}>Stock: {p.quantity}</span>
                        {role !== 'admin' && <button onClick={() => setCart([...cart, p])} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">+ Add</button>}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* STAFF CART */}
      {role !== 'admin' && (
          <div className="w-80 bg-white p-6 rounded shadow h-fit">
            <h2 className="text-xl font-bold mb-4">🛒 Checkout</h2>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {cart.map((item, i) => <div key={i} className="flex justify-between text-sm border-b"><span>{item.name}</span><span>${item.price}</span></div>)}
            </div>
            <div className="flex justify-between font-bold text-lg mb-4"><span>Total:</span><span>${cart.reduce((sum, item) => sum + item.price, 0)}</span></div>
            <input className="w-full border p-2 rounded mb-2 text-sm" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <textarea className="w-full border p-2 rounded mb-4 text-sm" placeholder="Address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            <button onClick={handleCheckout} className="w-full py-2 bg-green-600 text-white rounded font-bold">Confirm Order</button>
          </div>
      )}

      {/* 📊 ADMIN ORDER HISTORY MODAL */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-3/4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">📂 Sales History</h2>
                    <button onClick={() => setIsOrderModalOpen(false)} className="text-red-500 font-bold">✕ Close</button>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-2">Date</th>
                            <th className="p-2">Customer</th>
                            <th className="p-2">Items</th>
                            <th className="p-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o._id} className="border-b hover:bg-gray-50">
                                <td className="p-2 text-sm text-gray-500">{new Date(o.date).toLocaleDateString()}</td>
                                <td className="p-2 font-bold">{o.customerName}<div className="text-xs font-normal text-gray-400">{o.address}</div></td>
                                <td className="p-2 text-sm">{o.items.map((i:any) => i.name).join(', ')}</td>
                                <td className="p-2 font-bold text-green-600">${o.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* 🔑 CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
                <h2 className="text-lg font-bold mb-4">Change Password</h2>
                <input type="password" placeholder="Old Password" className="w-full border p-2 rounded mb-2" onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} />
                <input type="password" placeholder="New Password" className="w-full border p-2 rounded mb-4" onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-500">Cancel</button>
                    <button onClick={handleChangePassword} className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}