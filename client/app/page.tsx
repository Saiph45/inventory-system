'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
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
      const token = localStorage.getItem('token'); // Get token
      // 👇 IMPORTANT FIX: Send Token to Server
      const res = await fetch('https://inventory-system-vef6.onrender.com/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const res = await fetch('https://inventory-system-vef6.onrender.com/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newProduct),
    });

    if (res.ok) {
      alert("✅ Product Added Successfully!");
      setNewProduct({ name: '', price: '', quantity: '' }); // Clear form
      fetchProducts(); // Refresh list immediately
    } else {
      alert("❌ Failed to add product");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this item?")) return;
    
    const token = localStorage.getItem('token');
    await fetch(`https://inventory-system-vef6.onrender.com/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchProducts();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Inventory...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow-sm">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">📦 Inventory System</h1>
           <p className="text-gray-500 text-sm">Manage your stock levels</p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
            role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {role} Account
          </span>
          
          <button onClick={handleLogout} className="text-red-500 font-bold hover:text-red-700 border px-3 py-1 rounded hover:bg-red-50">
            Logout
          </button>
        </div>
      </div>

      {/* ADMIN ADD FORM */}
      {role === 'admin' ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-purple-500">
          <h2 className="text-lg font-bold mb-4">Add New Item</h2>
          <form onSubmit={handleAddProduct} className="flex gap-4">
            <input placeholder="Product Name" className="border p-2 rounded w-full" 
              value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
            <input placeholder="Price" type="number" className="border p-2 rounded w-24" 
              value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
            <input placeholder="Qty" type="number" className="border p-2 rounded w-24" 
              value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} required />
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-bold">
              + Add
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded mb-8 text-blue-800 border border-blue-200 flex items-center gap-3">
          <span className="text-xl">👀</span>
          <div>
            <strong>View-Only Mode:</strong> You are logged in as a Staff member. You can view stock, but cannot edit.
          </div>
        </div>
      )}

      {/* PRODUCT LIST */}
      <div className="grid gap-4">
        {products.length === 0 ? (
           <p className="text-center text-gray-500 py-10">No products found. Add some items above!</p>
        ) : (
          products.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded shadow flex justify-between items-center border border-gray-100 hover:shadow-md transition">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                <div className="text-sm text-gray-500 mt-1 flex gap-3">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Price: ${p.price}</span>
                    <span className={`px-2 py-0.5 rounded ${p.quantity < 5 ? 'bg-red-100 text-red-800 font-bold' : 'bg-gray-100'}`}>
                        Stock: {p.quantity}
                    </span>
                </div>
              </div>
              {role === 'admin' && (
                <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:bg-red-50 p-2 rounded" title="Delete Product">
                    🗑️
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}