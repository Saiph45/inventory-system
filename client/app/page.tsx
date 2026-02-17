'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const router = useRouter();

  // Order Details State
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');

  // Admin Form State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });

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

  // ✅ FIXED: Now shows errors if Add fails
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch('https://inventory-system-vef6.onrender.com/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(newProduct),
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ Added!");
            setNewProduct({ name: '', price: '', quantity: '' });
            fetchProducts();
        } else {
            alert("❌ Failed: " + (data.message || "Unknown Error"));
        }
    } catch (error) {
        alert("❌ Network Error: Server might be sleeping or crashed.");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this item?")) return;
    await fetch(`https://inventory-system-vef6.onrender.com/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const addToCart = (product: any) => {
    if (product.quantity > 0) {
        setCart([...cart, product]);
    } else {
        alert("Out of Stock!");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    if (!customerName || !address) return alert("Please enter Customer Name and Address!");
    
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerName, address }),
    });

    const data = await res.json();

    if (res.ok) {
        alert("✅ Order Placed Successfully!");
        setCart([]);
        setCustomerName('');
        setAddress('');
        fetchProducts();
    } else {
        alert("❌ Failed: " + data.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50 flex gap-8">
      
      {/* LEFT SIDE: PRODUCT LIST */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">📦 Inventory</h1>
            <button onClick={handleLogout} className="text-red-500 font-bold border px-3 py-1 rounded">Logout</button>
        </div>

        {/* Admin Add Form */}
        {role === 'admin' && (
            <form onSubmit={handleAddProduct} className="bg-white p-4 rounded shadow mb-6 flex gap-2">
                <input placeholder="Name" className="border p-2 rounded w-full" value={newProduct.name} onChange={(e)=>setNewProduct({...newProduct, name: e.target.value})} />
                <input placeholder="Price" type="number" className="border p-2 rounded w-20" value={newProduct.price} onChange={(e)=>setNewProduct({...newProduct, price: e.target.value})} />
                <input placeholder="Qty" type="number" className="border p-2 rounded w-20" value={newProduct.quantity} onChange={(e)=>setNewProduct({...newProduct, quantity: e.target.value})} />
                <button className="bg-purple-600 text-white px-4 rounded">Add</button>
            </form>
        )}

        <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
                <div key={p._id} className="bg-white p-4 rounded shadow flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold">{p.name}</h3>
                        <p className="text-sm text-gray-500">${p.price}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${p.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            Stock: {p.quantity}
                        </span>
                        {role === 'admin' ? (
                            <button onClick={() => handleDelete(p._id)} className="text-red-500">🗑️</button>
                        ) : (
                            <button onClick={() => addToCart(p)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                + Add
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* RIGHT SIDE: CART */}
      {role !== 'admin' && (
          <div className="w-96 bg-white p-6 rounded shadow h-fit border border-gray-200">
            <h2 className="text-xl font-bold mb-4">🛒 Checkout</h2>
            <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                {cart.length === 0 ? <p className="text-gray-400 text-sm">Cart is empty.</p> : cart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm border-b pb-1">
                        <span>{item.name}</span>
                        <span>${item.price}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total:</span>
                <span>${cart.reduce((sum, item) => sum + item.price, 0)}</span>
            </div>
            <div className="mb-4">
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Customer Name</label>
                <input className="w-full border p-2 rounded text-sm" placeholder="John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)}/>
            </div>
            <div className="mb-6">
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Delivery Address</label>
                <textarea className="w-full border p-2 rounded text-sm" placeholder="123 Main St..." rows={2} value={address} onChange={(e) => setAddress(e.target.value)}/>
            </div>
            <button onClick={handleCheckout} disabled={cart.length === 0} className={`w-full py-3 rounded font-bold text-white transition ${cart.length === 0 ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'}`}>Confirm Order</button>
          </div>
      )}
    </div>
  );
}