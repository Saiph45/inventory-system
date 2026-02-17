'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const [email, setEmail] = useState(''); // Store user email
  const router = useRouter();

  // Order Details
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');

  // Admin Add Product
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });

  // Change Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    
    // Decode token to get email (Simplified: we just store email in localStorage during login for this demo)
    // For now, let's just use the role and fetch products
    setRole(localStorage.getItem('role') || 'staff');
    setEmail(localStorage.getItem('userEmail') || ''); // You need to save this on login page!
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('https://inventory-system-vef6.onrender.com/api/products');
      const data = await res.json();
      setProducts(data);
    } catch(err) { console.error(err); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        await fetch('https://inventory-system-vef6.onrender.com/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(newProduct),
        });
        setNewProduct({ name: '', price: '', quantity: '' });
        fetchProducts();
        alert("✅ Product Added/Restocked!");
    } catch (error) { alert("Error adding product"); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // We need the email to identify the user. 
    // NOTE: In a real app, we extract this from the Token. 
    // For this quick fix, we will ask the user to confirm their email in the popup.
    const confirmEmail = prompt("Please confirm your email address:");
    if (!confirmEmail) return;

    const res = await fetch('https://inventory-system-vef6.onrender.com/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: confirmEmail, 
            oldPassword: passwordForm.oldPassword, 
            newPassword: passwordForm.newPassword 
        }),
    });

    const data = await res.json();
    if (res.ok) {
        alert("✅ Success! " + data.message);
        setIsPasswordModalOpen(false);
        setPasswordForm({ oldPassword: '', newPassword: '' });
    } else {
        alert("❌ Failed: " + data.error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50 flex gap-8">
      
      {/* MAIN CONTENT */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">📦 Inventory Dashboard</h1>
                <p className="text-gray-500 text-sm">Welcome, {role.toUpperCase()}</p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="text-blue-600 font-bold border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 text-sm"
                >
                    🔑 Change Password
                </button>
                <button onClick={handleLogout} className="text-red-500 font-bold border border-red-200 px-3 py-1 rounded hover:bg-red-50 text-sm">
                    Logout
                </button>
            </div>
        </div>

        {/* CHANGE PASSWORD MODAL */}
        {isPasswordModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-96">
                    <h2 className="text-lg font-bold mb-4">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <input 
                            type="password" placeholder="Old Password" required 
                            className="w-full border p-2 rounded"
                            value={passwordForm.oldPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        />
                         <input 
                            type="password" placeholder="New Password" required 
                            className="w-full border p-2 rounded"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Update</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ... (Rest of your Product List code remains the same) ... */}
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
                        {/* Add to Cart Button Logic here... */}
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      {/* ... (Cart Sidebar Code remains the same) ... */}
    </div>
  );
}