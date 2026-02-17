'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const router = useRouter();

  // Admin Form State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setRole(localStorage.getItem('role') || 'staff');
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/products');
    const data = await res.json();
    setProducts(data);
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
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this item?")) return;
    await fetch(`https://inventory-system-vef6.onrender.com/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  // ✅ CART FUNCTIONS
  const addToCart = (product: any) => {
    if (product.quantity > 0) {
        setCart([...cart, product]);
    } else {
        alert("Out of Stock!");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart }),
    });

    if (res.ok) {
        alert("✅ Order Placed! Stock updated.");
        setCart([]); // Clear cart
        fetchProducts(); // Refresh stock numbers
    } else {
        alert("❌ Order Failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50 flex gap-8">
      
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

        <div className="grid gap-3">
            {products.map((p) => (
                <div key={p._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                        <h3 className="font-bold">{p.name}</h3>
                        <p className="text-sm text-gray-500">${p.price} | Stock: {p.quantity}</p>
                    </div>
                    <div>
                        {role === 'admin' ? (
                            <button onClick={() => handleDelete(p._id)} className="text-red-500 p-2">🗑️</button>
                        ) : (
                            <button onClick={() => addToCart(p)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                + Add to Order
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* RIGHT SIDE: CART (Only for Staff) */}
      {role !== 'admin' && (
          <div className="w-80 bg-white p-6 rounded shadow h-fit border border-gray-200">
            <h2 className="text-xl font-bold mb-4">🛒 New Order</h2>
            {cart.length === 0 ? (
                <p className="text-gray-400 text-sm">Select items to add them here.</p>
            ) : (
                <div className="space-y-2 mb-4">
                    {cart.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm border-b pb-1">
                            <span>{item.name}</span>
                            <span>${item.price}</span>
                        </div>
                    ))}
                    <div className="pt-2 font-bold text-lg flex justify-between border-t mt-4">
                        <span>Total:</span>
                        <span>${cart.reduce((sum, item) => sum + item.price, 0)}</span>
                    </div>
                </div>
            )}
            <button 
                onClick={handleCheckout} 
                disabled={cart.length === 0}
                className={`w-full py-2 rounded font-bold text-white ${cart.length === 0 ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'}`}
            >
                Confirm Order
            </button>
          </div>
      )}
    </div>
  );
}