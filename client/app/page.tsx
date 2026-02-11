'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const router = useRouter();

  // Form State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });

  useEffect(() => {
    // 1. Check Token
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 2. Get Role
    setRole(localStorage.getItem('role') || 'user');

    // 3. Fetch Data
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('https://inventory-system-vef6.onrender.com/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('https://inventory-system-vef6.onrender.com/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newProduct),
    });
    setNewProduct({ name: '', price: '', quantity: '' });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this item?")) return;
    const token = localStorage.getItem('token');
    await fetch(`https://inventory-system-vef6.onrender.com/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchProducts();
  };

  // ✅ FIXED LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login'; // Force reload to login page
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">📦 Inventory System</h1>
        
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
            role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {role} Account
          </span>
          
          <button onClick={handleLogout} className="text-red-500 font-bold hover:text-red-700">
            Logout
          </button>
        </div>
      </div>

      {/* ADMIN FORM */}
      {role === 'admin' ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-purple-500">
          <h2 className="text-lg font-bold mb-4">Add New Item</h2>
          <form onSubmit={handleAddProduct} className="flex gap-4">
            <input placeholder="Name" className="border p-2 rounded w-full" 
              value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
            <input placeholder="Price" type="number" className="border p-2 rounded w-24" 
              value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
            <input placeholder="Qty" type="number" className="border p-2 rounded w-24" 
              value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} required />
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Add</button>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded mb-8 text-blue-800 border border-blue-200">
          👀 <strong>View-Only Mode:</strong> You can see stock, but cannot edit.
        </div>
      )}

      {/* PRODUCT LIST */}
      <div className="grid gap-4">
        {products.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-gray-500">${p.price} | Stock: {p.quantity}</p>
            </div>
            {role === 'admin' && (
              <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}