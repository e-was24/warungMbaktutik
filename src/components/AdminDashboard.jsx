import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ onBack }) => {
    const [orders, setOrders] = useState([]);
    const [customProducts, setCustomProducts] = useState([]);
    const [stats, setStats] = useState({ totalOrders: 0, successOrders: 0, totalRevenue: 0, cancelledOrders: 0 });
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'minuman' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const storedOrders = JSON.parse(localStorage.getItem('warung_orders') || '[]');
        setOrders([...storedOrders].reverse());
        
        const successOrders = storedOrders.filter(o => o.status !== 'cancelled');
        const cancelledOrders = storedOrders.filter(o => o.status === 'cancelled');
        const totalRevenue = successOrders.reduce((sum, order) => sum + order.total, 0);

        setStats({
            totalOrders: storedOrders.length,
            successOrders: successOrders.length,
            cancelledOrders: cancelledOrders.length,
            totalRevenue: totalRevenue
        });

        const storedProducts = JSON.parse(localStorage.getItem('warung_custom_products') || '[]');
        setCustomProducts(storedProducts);
    };

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

    const toggleOrderStatus = (timestamp) => {
        const storedOrders = JSON.parse(localStorage.getItem('warung_orders') || '[]');
        const updatedOrders = storedOrders.map(order => {
            if (order.timestamp === timestamp) {
                return { 
                    ...order, 
                    status: order.status === 'cancelled' ? 'success' : 'cancelled' 
                };
            }
            return order;
        });
        localStorage.setItem('warung_orders', JSON.stringify(updatedOrders));
        loadData();
    };

    const clearData = () => {
        if (window.confirm('Hapus semua riwayat pesanan?')) {
            localStorage.removeItem('warung_orders');
            loadData();
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
                    <div className='stat-card success'>
                        <span className='stat-label'>Berhasil</span>
                        <span className='stat-value'>{stats.successOrders}</span>
                    </div>
                    <div className='stat-card accent'>
                        <span className='stat-label'>Total Omset</span>
                        <span className='stat-value'>Rp {stats.totalRevenue.toLocaleString('id-ID')}</span>
                    </div>
                    <div className='stat-card danger'>
                        <span className='stat-label'>Dibatalkan</span>
                        <span className='stat-value'>{stats.cancelledOrders}</span>
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
                        className='categoryOption'
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
                    <h2>Pesanan Baru (Card Pembelian)</h2>
                    <div className='orders-cards-grid'>
                        {orders.length === 0 ? (
                            <div className='empty-state'>Belum ada pesanan masuk.</div>
                        ) : (
                            orders.map((order, i) => (
                                <div key={order.timestamp} className={`order-purchase-card ${order.status === 'cancelled' ? 'is-cancelled' : ''}`}>
                                    <div className='o-card-header'>
                                        <div className='o-customer-meta'>
                                            <span className='o-time'>{new Date(order.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                                            <h3 className='o-customer-name'>{order.customer.name}</h3>
                                        </div>
                                        <div className={`o-status-badge ${order.status === 'cancelled' ? 'bg-danger' : 'bg-success'}`}>
                                            {order.status === 'cancelled' ? 'DIBATALKAN' : 'BERHASIL'}
                                        </div>
                                    </div>

                                    {order.customer.address && (
                                        <div className='o-address'>📍 {order.customer.address}</div>
                                    )}

                                    <div className='o-items-container'>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className='o-item-row'>
                                                <span className='o-item-qty'>{item.quantity}x</span>
                                                <span className='o-item-name'>{item.name}</span>
                                                <span className='o-item-price'>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className='o-card-footer'>
                                        <div className='o-total-info'>
                                            <span className='label'>Total Bayar</span>
                                            <span className='value'>Rp {order.total.toLocaleString('id-ID')}</span>
                                        </div>
                                        <button 
                                            className={`o-action-btn ${order.status === 'cancelled' ? 'restore' : 'cancel'}`}
                                            onClick={() => toggleOrderStatus(order.timestamp)}
                                        >
                                            {order.status === 'cancelled' ? 'Pulihkan' : 'Batalkan'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
