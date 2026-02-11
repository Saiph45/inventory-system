'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [role, setRole] = useState(''); // Stores 'admin' or 'user'
  const router = useRouter();

  // Form State for new product
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });

  useEffect(() => {
    // 1. Check for Token (Security)
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 2. Get Role from Storage
    const savedRole = localStorage.getItem('role');
    setRole(savedRole || 'user'); // Default to 'user' if missing

    // 3. Fetch Products
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
    
    setNewProduct({ name: '', price: '', quantity: '' }); // Reset form
    fetchProducts(); // Refresh list
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

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      
      {/* HEADER & ROLE BADGE */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📦 Inventory</h1>
          <p className="text-sm text-gray-500">Manage your stock levels</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${
            role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {role} Account
          </span>

          <button 
            onClick={() => { localStorage.clear(); router.push('/login'); }} 
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🔒 ADMIN SECTION: ADD PRODUCT FORM */}
      {role === 'admin' ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-purple-500">
          <h2 className="text-lg font-bold mb-4">Add New Item</h2>
          <form onSubmit={handleAddProduct} className="flex flex-wrap gap-4">
            <input 
              placeholder="Product Name" 
              className="border p-2 rounded flex-grow"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              required
            />
            <input 
              placeholder="Price" 
              type="number" 
              className="border p-2 rounded w-32"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              required
            />
             <input 
              placeholder="Qty" 
              type="number" 
              className="border p-2 rounded w-24"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
              required
            />
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-semibold">
              + Add
            </button>
          </form>
        </div>
      ) : (
        /* 👤 USER VIEW: READ ONLY MESSAGE */
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8 text-blue-800 flex items-center gap-3">
          <span className="text-2xl">👀</span>
          <div>
            <p className="font-bold">View-Only Mode</p>
            <p className="text-sm">You are logged in as a <strong>User</strong>. You can view stock levels but cannot edit them.</p>
          </div>
        </div>
      )}

      {/* PRODUCT LIST (Visible to Both) */}
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition flex justify-between items-center border border-gray-100">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
              <div className="flex gap-4 mt-1 text-sm text-gray-600">
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Price: ${product.price}</span>
                <span className={`px-2 py-0.5 rounded ${product.quantity < 5 ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                  Stock: {product.quantity}
                </span>
              </div>
            </div>
            
            {/* 🔒 ADMIN ONLY: Delete Button */}
            {role === 'admin' && (
              <button 
                onClick={() => handleDelete(product._id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                title="Delete Item"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}