import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ onBack }) => {
    const [orders, setOrders] = useState([]);
    const [customProducts, setCustomProducts] = useState([]);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'minuman' });

    useEffect(() => {
        const storedOrders = JSON.parse(localStorage.getItem('warung_orders') || '[]');
        setOrders(storedOrders.reverse());
        
        const totalRevenue = storedOrders.reduce((sum, order) => sum + order.total, 0);
        setStats({
            totalOrders: storedOrders.length,
            totalRevenue: totalRevenue
        });

        const storedProducts = JSON.parse(localStorage.getItem('warung_custom_products') || '[]');
        setCustomProducts(storedProducts);
    }, []);

    const handleAddProduct = (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return;

        const product = {
            ...newProduct,
            price: parseInt(newProduct.price),
            id: Date.now()
        };

        const updatedProducts = [...customProducts, product];
        localStorage.setItem('warung_custom_products', JSON.stringify(updatedProducts));
        setCustomProducts(updatedProducts);
        setNewProduct({ name: '', price: '', category: 'minuman' });
        
        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
    };

    const deleteProduct = (id) => {
        const updatedProducts = customProducts.filter(p => p.id !== id);
        localStorage.setItem('warung_custom_products', JSON.stringify(updatedProducts));
        setCustomProducts(updatedProducts);
        window.dispatchEvent(new Event('storage'));
    };

    const clearData = () => {
        if (window.confirm('Hapus semua riwayat pesanan?')) {
            localStorage.removeItem('warung_orders');
            setOrders([]);
            setStats({ totalOrders: 0, totalRevenue: 0 });
        }
    };

    return (
        <div className='admin-layout'>
            <nav className='admin-nav'>
                <button className='back-btn' onClick={onBack}>← Back to shop</button>
                <h1>Admin Dashboard</h1>
                <button className='danger-btn' onClick={clearData}>Reset Data</button>
            </nav>

            <main className='admin-content'>
                <div className='stats-grid'>
                    <div className='stat-card'>
                        <span className='stat-label'>Total Pesanan</span>
                        <span className='stat-value'>{stats.totalOrders}</span>
                    </div>
                    <div className='stat-card accent'>
                        <span className='stat-label'>Total Pendapatan</span>
                        <span className='stat-value'>Rp {stats.totalRevenue.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* Add Product Section */}
                <div className='admin-section'>
                    <h2>Tambah Produk Baru</h2>
                    <form className='add-product-bar' onSubmit={handleAddProduct}>
                        <input 
                            type='text' 
                            placeholder='Nama Produk' 
                            value={newProduct.name}
                            onChange={e => setNewProduct({...newProduct, name: e.target.value.toUpperCase()})}
                            required
                        />
                        <input 
                            type='number' 
                            placeholder='Harga (IDR)' 
                            value={newProduct.price}
                            onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                            required
                        />
                        <select 
                            value={newProduct.category}
                            onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        >
                            <option value='minuman'>Minuman</option>
                            <option value='makanan'>Seblak</option>
                        </select>
                        <button type='submit' className='add-btn'>Tambah</button>
                    </form>
                </div>

                {/* Product Management Section */}
                <div className='admin-section'>
                    <h2>Manajemen Produk Kamu</h2>
                    <div className='products-grid'>
                        {customProducts.length === 0 ? (
                            <div className='empty-state'>Belum ada produk custom.</div>
                        ) : (
                            customProducts.map(product => (
                                <div key={product.id} className='product-item-card'>
                                    <div className='p-info'>
                                        <span className='p-name'>{product.name}</span>
                                        <span className='p-cat'>{product.category}</span>
                                        <span className='p-price'>Rp {product.price.toLocaleString('id-ID')}</span>
                                    </div>
                                    <button className='delete-p-btn' onClick={() => deleteProduct(product.id)}>&times;</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className='orders-section'>
                    <h2>Riwayat Pesanan Terbaru</h2>
                    <div className='orders-table-wrapper'>
                        {orders.length === 0 ? (
                            <div className='empty-state'>Belum ada pesanan masuk.</div>
                        ) : (
                            <table className='orders-table'>
                                <thead>
                                    <tr>
                                        <th>Waktu</th>
                                        <th>Pelanggan</th>
                                        <th>Alamat</th>
                                        <th>Detail Pesanan</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, i) => (
                                        <tr key={i}>
                                            <td className='time-td'>{new Date(order.timestamp).toLocaleString('id-ID')}</td>
                                            <td><strong>{order.customer.name}</strong></td>
                                            <td className='address-td'>{order.customer.address || '-'}</td>
                                            <td>
                                                <ul className='order-items-list'>
                                                    {order.items.map((item, idx) => (
                                                        <li key={idx}>{item.name} ({item.quantity}x)</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className='price-td'>Rp {order.total.toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
