import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ onBack }) => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });

    useEffect(() => {
        const storedOrders = JSON.parse(localStorage.getItem('warung_orders') || '[]');
        setOrders(storedOrders.reverse()); // Show newest first
        
        const totalRevenue = storedOrders.reduce((sum, order) => sum + order.total, 0);
        setStats({
            totalOrders: storedOrders.length,
            totalRevenue: totalRevenue
        });
    }, []);

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
