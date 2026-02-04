'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { fetchProducts, createOrder } from '@/utils/api';

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // 1. CHECK IF LOGGED IN
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login'); // Redirect to login if no token
      return;
    }

    // 2. Load Data if logged in
    loadData();
  }, []);

  // Define the function inside the component
  const loadData = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const handleBuy = async (productId: string) => {
    await createOrder([{ productId, quantity: 1 }]);
    alert('Order Placed!');
    loadData(); // Refresh stock
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p: any) => (
          <div key={p._id} className="bg-white p-6 rounded-xl shadow border">
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p className="text-gray-500">SKU: {p.sku}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className={`font-bold ${p.stock < p.minStock ? 'text-red-600' : 'text-green-600'}`}>
                Stock: {p.stock}
              </span>
              <button 
                onClick={() => handleBuy(p._id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Sell 1 Unit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}