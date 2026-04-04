import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// Default Menu Data for Seeding
const DEFAULT_MENU_DATA = [
    // Minuman
    { name: 'TEA', variant: 'LEMON TEA', price: 5000, category: 'minuman', id: 'def-1' },
    { name: 'TEA', variant: 'LYCHEE TEA', price: 5000, category: 'minuman', id: 'def-2' },
    { name: 'TEA', variant: 'MANGO TEA', price: 5000, category: 'minuman', id: 'def-3' },
    { name: 'TEA', variant: 'STRAWBERRY TEA', price: 5000, category: 'minuman', id: 'def-4' },
    { name: 'TEA', variant: 'GRAPE TEA', price: 5000, category: 'minuman', id: 'def-5' },
    { name: 'TEA', variant: 'MELON TEA', price: 5000, category: 'minuman', id: 'def-6' },
    { name: 'YAKULT', variant: 'YAKULT STRAWBERRY', price: 8000, category: 'minuman', id: 'def-7' },
    { name: 'YAKULT', variant: 'YAKULT ORANGE', price: 8000, category: 'minuman', id: 'def-8' },
    { name: 'YAKULT', variant: 'YAKULT GRAPE', price: 8000, category: 'minuman', id: 'def-9' },
    { name: 'YAKULT', variant: 'YAKULT LYCHEE', price: 8000, category: 'minuman', id: 'def-10' },
    { name: 'YAKULT', variant: 'YAKULT MELON', price: 8000, category: 'minuman', id: 'def-11' },
    { name: 'ES TELER', variant: 'ES TELER CREAMY', price: 10000, category: 'minuman', id: 'def-12' },
    { name: 'MOJITO', variant: 'MOJITO STRAWBERRY', price: 8000, category: 'minuman', id: 'def-13' },
    { name: 'MOJITO', variant: 'MOJITO LEMON', price: 8000, category: 'minuman', id: 'def-14' },
    { name: 'MOJITO', variant: 'MOJITO MELON', price: 8000, category: 'minuman', id: 'def-15' },
    { name: 'MOJITO', variant: 'MOJITO LYCHEE', price: 8000, category: 'minuman', id: 'def-16' },
    { name: 'MOJITO', variant: 'MOJITO ORANGE', price: 8000, category: 'minuman', id: 'def-17' },
    { name: 'MOJITO', variant: 'MOJITO GRAPE', price: 8000, category: 'minuman', id: 'def-18' },
    { name: 'ALPUKAT KOCOK', variant: 'ORIGINAL', price: 10000, category: 'minuman', id: 'def-19' },
    { name: 'ALPUKAT KOCOK', variant: 'MILO', price: 10000, category: 'minuman', id: 'def-20' },
    { name: 'ALPUKAT KOCOK', variant: 'KEJU BERUTAL', price: 10000, category: 'minuman', id: 'def-21' },
    { name: 'ALPUKAT KOCOK', variant: 'COKLAT + KEJU', price: 10000, category: 'minuman', id: 'def-22' },
    { name: 'ALPUKAT KOCOK', variant: 'COKLAT PARUT', price: 10000, category: 'minuman', id: 'def-23' },
    // Makanan (Seblak)
    { name: 'SEBLAK REGULER', variant: 'SEBLAK SOSIS', price: 10000, category: 'makanan', id: 'def-24' },
    { name: 'SEBLAK REGULER', variant: 'SEBLAK BAKSO', price: 10000, category: 'makanan', id: 'def-25' },
    { name: 'SEBLAK REGULER', variant: 'SEBLAK HEMAT', price: 10000, category: 'makanan', id: 'def-26' },
    { name: 'SEBLAK REGULER', variant: 'SEBLAK BIASA', price: 12000, category: 'makanan', id: 'def-27' },
    { name: 'SEBLAK PREMIUM', variant: 'SEBLAK CUANKI 🔥', price: 15000, category: 'makanan', id: 'def-28' },
    { name: 'SEBLAK PREMIUM', variant: 'SEBLAK SPESIAL', price: 15000, category: 'makanan', id: 'def-29' },
    { name: 'SEBLAK PREMIUM', variant: 'SEBLAK ISTIMEWA', price: 20000, category: 'makanan', id: 'def-30' },
    { name: 'SEBLAK EXTRA', variant: 'SEBLAK BLENGER', price: 30000, category: 'makanan', id: 'def-31' },
    // Bakaran
    { name: 'DUMPLING', variant: 'CHEESE DUMPLING', price: 3000, category: 'bakaran', id: 'def-32' },
    { name: 'DUMPLING', variant: 'CHICKEN DUMPLING', price: 3000, category: 'bakaran', id: 'def-33' },
    { name: 'SOSIS', variant: 'SOSIS JUMBO', price: 10000, category: 'bakaran', id: 'def-34' },
    { name: 'SOSIS', variant: 'SOSIS MEDIUM', price: 5000, category: 'bakaran', id: 'def-35' },
    { name: 'BAKSO', variant: 'BAKSO BAKAR', price: 5000, category: 'bakaran', id: 'def-36' },
    { name: 'SCALLOP', variant: 'SCALLOP BAKAR', price: 3000, category: 'bakaran', id: 'def-37' },
    { name: 'CHIKUWA', variant: 'CHIKUWA BAKAR', price: 3000, category: 'bakaran', id: 'def-38' },
    // Fashion
    { name: 'DASTER', variant: 'DASTER BUSUI ARAB', price: 35000, category: 'fashion', id: 'def-39' },
    { name: 'HIJAB', variant: 'BELLA SQUARE', price: 15000, category: 'fashion', id: 'def-40' },
    { name: 'KAOS', variant: 'OVERSIZE T-SHIRT', price: 45000, category: 'fashion', id: 'def-41' },
    { name: 'CELANA', variant: 'KULOT LINEN', price: 55000, category: 'fashion', id: 'def-42' },
];

const AdminDashboard = ({ onBack }) => {
    const [orders, setOrders] = useState([]);
    const [customProducts, setCustomProducts] = useState([]);
    const [stats, setStats] = useState({ totalOrders: 0, successOrders: 0, totalRevenue: 0, cancelledOrders: 0 });
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'minuman', variant: '', image: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [uploadingGroup, setUploadingGroup] = useState(null);
    const [editingVariant, setEditingVariant] = useState(null); // { id, price, variant }
    const [syncStatus, setSyncStatus] = useState('');
    const [categoryStatus, setCategoryStatus] = useState({
        minuman: 'open',
        makanan: 'open',
        bakaran: 'open',
        fashion: 'open'
    });

    useEffect(() => {
        loadData();
        fetchCloudData(); // Pull latest from Vercel Blob to stay synced
        
        // Add polling for new orders (every 30 seconds)
        const interval = setInterval(fetchCloudData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchCloudData = async () => {
        try {
            const res = await fetch(`/api/sync?t=${Date.now()}`);
            if (!res.ok) return;
            const cloudData = await res.json();
            
            // Support legacy array and new object format
            const cloudProducts = Array.isArray(cloudData) ? cloudData : (cloudData.products || []);
            const isInitialized = cloudData.isInitialized || false;

            if (isInitialized) {
                // If cloud is established, it's the source of truth
                setCustomProducts(cloudProducts);
                localStorage.setItem('warung_custom_products', JSON.stringify(cloudProducts));
                
                if (cloudData.categoryStatus) {
                    setCategoryStatus(cloudData.categoryStatus);
                    localStorage.setItem('warung_category_status', JSON.stringify(cloudData.categoryStatus));
                }

                if (cloudData.orders) {
                    setOrders([...cloudData.orders].reverse());
                    localStorage.setItem('warung_orders', JSON.stringify(cloudData.orders));
                    
                    // Re-calculate stats based on cloud orders
                    const successOrders = cloudData.orders.filter(o => o.status !== 'cancelled');
                    const cancelledOrders = cloudData.orders.filter(o => o.status === 'cancelled');
                    const totalRevenue = successOrders.reduce((sum, order) => sum + order.total, 0);

                    setStats({
                        totalOrders: cloudData.orders.length,
                        successOrders: successOrders.length,
                        cancelledOrders: cancelledOrders.length,
                        totalRevenue: totalRevenue
                    });
                }
            }
        } catch (err) {
            console.warn("Could not sync with cloud on mount:", err);
        }
    };

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

        const storedStatus = JSON.parse(localStorage.getItem('warung_category_status') || '{}');
        if (Object.keys(storedStatus).length > 0) {
            setCategoryStatus(prev => ({ ...prev, ...storedStatus }));
        }
    };

    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    };

    const handleImageChange = async (e) => {
        if (e.target.files[0]) {
            const resized = await resizeImage(e.target.files[0]);
            setNewProduct({ ...newProduct, image: resized });
            setImagePreview(resized);
        }
    };

    const pushToCloud = async (products, updatedStatus) => {
        setSyncStatus('Auto-Saving...');
        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    products: products,
                    categoryStatus: updatedStatus || categoryStatus,
                    isInitialized: true 
                })
            });
            if (response.ok) {
                setSyncStatus('Tersimpan di Cloud ✅');
                setTimeout(() => setSyncStatus(''), 3000);
            }
        } catch (err) {
            console.error("Auto-sync failed", err);
            setSyncStatus('Gagal Simpan ke Cloud ❌');
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return;

        setSyncStatus('Sedang Menambah Menu...');
        let finalImage = newProduct.image;

        // If it's a local preview (base64), upload it to Blob immediately
        if (finalImage && finalImage.startsWith('data:image')) {
            try {
                const res = await fetch(finalImage);
                const blobData = await res.blob();
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'x-filename': `product-${Date.now()}.png` },
                    body: blobData
                });
                if (uploadRes.ok) {
                    const result = await uploadRes.json();
                    finalImage = result.url;
                }
            } catch (err) {
                console.error("Upload failed in addProduct:", err);
            }
        }

        const product = {
            ...newProduct,
            image: finalImage,
            price: parseInt(newProduct.price),
            id: Date.now()
        };

        const updatedProducts = [...customProducts, product];
        localStorage.setItem('warung_custom_products', JSON.stringify(updatedProducts));
        setCustomProducts(updatedProducts);
        setNewProduct({ name: '', price: '', category: 'minuman', variant: '', image: null });
        setImagePreview(null);
        
        window.dispatchEvent(new Event('storage'));
        pushToCloud(updatedProducts);
    };

    const deleteProduct = async (id) => {
        const productToDelete = customProducts.find(p => p.id === id);
        if (!productToDelete) return;

        if (!confirm(`Hapus ${productToDelete.name}?`)) return;

        // If it has a cloud image, we could delete it from Blob (Optional but clean)
        if (productToDelete.image && productToDelete.image.includes('vercel-storage.com')) {
            try {
                fetch('/api/upload', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: productToDelete.image })
                });
            } catch (err) { console.warn("Failed to delete cloud image", err); }
        }

        const updatedProducts = customProducts.filter(p => p.id !== id);
        localStorage.setItem('warung_custom_products', JSON.stringify(updatedProducts));
        setCustomProducts(updatedProducts);
        window.dispatchEvent(new Event('storage'));
        
        pushToCloud(updatedProducts);
    };

    const updateProductVariant = (id, updatedData) => {
        const updatedProducts = customProducts.map(p => {
            if (p.id === id) return { ...p, ...updatedData };
            return p;
        });
        localStorage.setItem('warung_custom_products', JSON.stringify(updatedProducts));
        setCustomProducts(updatedProducts);
        setEditingVariant(null);
        window.dispatchEvent(new Event('storage'));
        
        pushToCloud(updatedProducts);
    };

    const handleGroupImageUpload = async (groupName, file) => {
        if (!file) return;
        setUploadingGroup(groupName);
        
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'x-filename': file.name },
                body: file,
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            
            // Update ALL products in the group with the new image
            const updatedProducts = customProducts.map(p => 
                p.name === groupName ? { ...p, image: data.url } : p
            );
            setCustomProducts(updatedProducts);
            localStorage.setItem('warung_custom_products', JSON.stringify(updatedProducts));
            
            pushToCloud(updatedProducts);
            alert(`Thumbnail ${groupName} berhasil diperbarui!`);
        } catch (err) {
            console.error(err);
            alert('Gagal mengunggah foto.');
        } finally {
            setUploadingGroup(null);
        }
    };

    const toggleOrderStatus = async (timestamp) => {
        const storedOrders = JSON.parse(localStorage.getItem('warung_orders') || '[]');
        let newStatus = 'success';
        const updatedOrders = storedOrders.map(order => {
            if (order.timestamp === timestamp) {
                newStatus = order.status === 'cancelled' ? 'success' : 'cancelled';
                return { ...order, status: newStatus };
            }
            return order;
        });

        localStorage.setItem('warung_orders', JSON.stringify(updatedOrders));
        
        // Push status update to Cloud
        try {
            await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'update_order_status',
                    timestamp: timestamp,
                    status: newStatus
                })
            });
        } catch (err) { console.error("Cloud order status update failed", err); }

        loadData();
    };

    const handleImportDefaults = () => {
        if (!confirm('Impor menu awal ke daftar manajemen? Ini akan memindahkan menu default ke sistem kartu agar bisa kamu edit harganya.')) return;
        
        // Remove duplicates based on name and variant
        const newItems = DEFAULT_MENU_DATA.filter(def => 
            !customProducts.some(p => p.name === def.name && p.variant === def.variant)
        );

        if (newItems.length === 0) {
            alert('Semua menu awal sudah ada d daftar management kamu!');
            return;
        }

        const updatedProducts = [...customProducts, ...newItems.map(item => ({
            ...item, 
            id: Date.now() + Math.floor(Math.random() * 1000)
        }))];
        
        localStorage.setItem('warung_custom_products', JSON.stringify(updatedProducts));
        setCustomProducts(updatedProducts);
        window.dispatchEvent(new Event('storage'));
        
        pushToCloud(updatedProducts);
        alert('Menu awal berhasil diimpor!');
    };

    const clearData = () => {
        if (confirm('Hapus SEMUA data produk & pesanan? Tindakan ini tidak bisa dibatalkan.')) {
            localStorage.clear();
            loadData();
            window.dispatchEvent(new Event('storage'));
            setSyncStatus('Semua data dibersihkan.');
        }
    };

    const syncToCloud = async () => {
        if (!confirm('Simpan perubahan ke Cloud (Internet)? Jika menu kosong, maka menu di HP pembeli juga akan terhapus.')) return;
        
        setIsSyncing(true);
        setSyncStatus('Sedang Mengunggah Foto & Menu...');
        
        try {
            // 1. Handle Image Uploads for all products
            const updatedProducts = await Promise.all(customProducts.map(async (p) => {
                // If it's still base64 (local), upload to Blob
                if (p.image && p.image.startsWith('data:image')) {
                    try {
                        // Use a timeout for the fetch to prevent hanging
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), 10000); // 10s timeout

                        const res = await fetch(p.image, { signal: controller.signal });
                        clearTimeout(id);
                        const blobData = await res.blob();
                        
                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            headers: { 'x-filename': `product-${p.id}.png` },
                            body: blobData
                        });
                        
                        if (uploadRes.ok) {
                            const result = await uploadRes.json();
                            return { ...p, image: result.url };
                        } else {
                            console.warn("Upload failed for", p.name, "falling back to local");
                        }
                    } catch (err) {
                        console.error("Error uploading image for", p.name, err);
                    }
                }
                return p;
            }));

            // Save updated products (with Cloud URLs) locally first
            localStorage.setItem('warung_custom_products', JSON.stringify(updatedProducts));

            // 2. Sync final menu JSON to Cloud
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    products: updatedProducts,
                    categoryStatus: categoryStatus,
                    isInitialized: true // Flag to tell HomePage to use ONLY cloud data
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                const diag = `\n\nPesan: ${errData.message || 'Error'}\nToken: ${errData.token_check || '?'}`;
                throw new Error(diag);
            }

            setSyncStatus('Berhasil di-Post! Foto & Menu Aman ✅');
            loadData(); // Reload to show new URLs
            setTimeout(() => setSyncStatus(''), 5000);
        } catch (error) {
            console.error("Sync Error:", error);
            setSyncStatus(`Gagal Sync ❌`);
            alert(`SINKRONISASI GAGAL!${error.message}`);
        } finally {
            setIsSyncing(false);
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

                {/* Cloud Sync Tool */}
                <div className='admin-section cloud-sync-box'>
                    <div className='sync-header'>
                        <h2>Cloud Synchronization & Tools</h2>
                        {syncStatus && <span className='sync-msg'>{syncStatus}</span>}
                    </div>
                    <div className='sync-actions'>
                        <p>Simpan perubahan (tambah/edit/hapus) ke Internet agar HP pembeli otomatis terupdate.</p>
                        <div className='btn-group-sync'>
                            <button 
                                className={`post-cloud-btn ${isSyncing ? 'loading' : ''}`} 
                                onClick={syncToCloud}
                                disabled={isSyncing}
                            >
                                {isSyncing ? 'SEDANG MENYIMPAN...' : 'SIMPAN & UPDATE CLOUD (SINKRON) 🚀'}
                            </button>
                            <button className='import-def-btn' onClick={handleImportDefaults}>MUAT MENU AWAL (TEA/SEBLAK) 📦</button>
                        </div>
                        <p style={{fontSize: '11px', marginTop: '10px', opacity: 0.7}}>* Produk yang kamu hapus juga akan hilang dari HP pembeli setelah klik tombol ini.</p>
                        {isSyncing && (
                            <button 
                                onClick={() => setIsSyncing(false)} 
                                style={{background: 'none', border: 'none', color: '#ff4444', fontSize: '10px', marginTop: '10px', cursor: 'pointer', textDecoration: 'underline'}}
                            >
                                Selesaikan Paksa (Jika Macet)
                            </button>
                        )}
                    </div>
                </div>

                {/* Add Product Section */}
                <div className='admin-section'>
                    <h2>Tambah Produk Baru</h2>
                    <form className='add-product-large-form' onSubmit={handleAddProduct}>
                        <div className='form-main'>
                            <div className='image-upload-box'>
                                {imagePreview ? (
                                    <div className='preview-container'>
                                        <img src={imagePreview} alt='Preview' />
                                        <button type='button' className='remove-img' onClick={() => {setImagePreview(null); setNewProduct({...newProduct, image: null})}}>&times;</button>
                                    </div>
                                ) : (
                                    <label className='upload-placeholder'>
                                        <input type='file' accept='image/*' onChange={handleImageChange} hidden />
                                        <span>+ Foto</span>
                                    </label>
                                )}
                            </div>
                            <div className='inputs-area'>
                                <input 
                                    type='text' 
                                    placeholder='Nama Menu (Misal: SEBLAK)' 
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({...newProduct, name: e.target.value.toUpperCase()})}
                                    list='existing-product-names'
                                    required
                                />
                                <datalist id='existing-product-names'>
                                    {[...new Set(customProducts.map(p => p.name))].map(name => (
                                        <option key={name} value={name} />
                                    ))}
                                </datalist>
                                <div className='row-inputs'>
                                    <input 
                                        type='text' 
                                        className='variant-input'
                                        placeholder='Varian (Misal: Spesial / Level 3)' 
                                        value={newProduct.variant}
                                        onChange={e => setNewProduct({...newProduct, variant: e.target.value})}
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
                                        <option value='bakaran'>Bakaran</option>
                                        <option value='fashion'>Fashion</option>
                                    </select>
                                </div>
                                <button type='submit' className='add-btn-full'>Tambah Menu ke Card</button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Product Management Section */}
                <div className='admin-section'>
                    <h2>Manajemen Produk Kamu</h2>
                    <div className='grouped-products-grid'>
                        {customProducts.length === 0 ? (
                            <div className='empty-state'>Belum ada produk custom.</div>
                        ) : (
                            Object.entries(
                                customProducts.reduce((acc, p) => {
                                    if (!acc[p.name]) acc[p.name] = [];
                                    acc[p.name].push(p);
                                    return acc;
                                }, {})
                            ).map(([name, variants]) => (
                                <div key={name} className='grouped-product-card'>
                                    <div className='gp-header'>
                                        <div className='gp-img-container' onClick={() => document.getElementById(`file-input-${name}`).click()}>
                                            {variants[0].image ? (
                                                <img src={variants[0].image} alt={name} className='gp-img' />
                                            ) : (
                                                <div className='gp-img-placeholder'>{name[0]}</div>
                                            )}
                                            <div className='gp-img-overlay'>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                                    <circle cx="12" cy="13" r="4" />
                                                </svg>
                                                <span>Ganti Foto</span>
                                            </div>
                                            {uploadingGroup === name && (
                                                <div className='gp-img-spinner'>
                                                    <div className='spinner-small'></div>
                                                </div>
                                            )}
                                            <input 
                                                id={`file-input-${name}`}
                                                type='file' 
                                                accept='image/*' 
                                                style={{ display: 'none' }}
                                                onChange={e => handleGroupImageUpload(name, e.target.files[0])}
                                            />
                                        </div>
                                        <div className='gp-info'>
                                            <span className='gp-name'>{name}</span>
                                            <span className='gp-cat'>{variants[0].category}</span>
                                        </div>
                                        <button 
                                            className='gp-edit-btn' 
                                            onClick={() => {
                                                setNewProduct({...newProduct, name: name, category: variants[0].category});
                                                document.querySelector('.add-product-large-form').scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            title='Tambah Varian/Harga'
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className='gp-variants'>
                                        {variants.map(v => (
                                            <div key={v.id} className='gp-variant-row'>
                                                {editingVariant && editingVariant.id === v.id ? (
                                                    <div className='inline-edit-form'>
                                                        <input 
                                                            type='text' 
                                                            value={editingVariant.variant} 
                                                            placeholder='Nama Label (Kecil/Besar)'
                                                            onChange={e => setEditingVariant({...editingVariant, variant: e.target.value})}
                                                        />
                                                        <input 
                                                            type='number' 
                                                            value={editingVariant.price} 
                                                            onChange={e => setEditingVariant({...editingVariant, price: e.target.value})}
                                                        />
                                                        <button className='save-v-btn' onClick={() => updateProductVariant(v.id, { variant: editingVariant.variant, price: parseInt(editingVariant.price) })}>✓</button>
                                                        <button className='cancel-v-btn' onClick={() => setEditingVariant(null)}>&times;</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className='v-label' onClick={() => setEditingVariant({ id: v.id, variant: v.variant || '', price: v.price })}>
                                                            <span className='v-name'>{v.variant || 'Klik untuk beri nama'}</span>
                                                            <span className='v-price'>Rp {v.price.toLocaleString('id-ID')}</span>
                                                        </div>
                                                        <div className='v-actions'>
                                                            <button className='edit-v-btn' onClick={() => setEditingVariant({ id: v.id, variant: v.variant || '', price: v.price })}>✎</button>
                                                            <button className='delete-v-btn' onClick={() => deleteProduct(v.id)}>&times;</button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Category Status Toggle */}
                <div className='admin-section category-status-box'>
                    <h2>Pengaturan Buka/Tutup Toko Per Kategori</h2>
                    <div className='category-toggles-grid'>
                        {Object.entries(categoryStatus).map(([cat, status]) => (
                            <div key={cat} className={`cat-toggle-card ${status}`}>
                                <div className='cat-toggle-info'>
                                    <span className='cat-toggle-name'>{cat.toUpperCase()}</span>
                                    <span className={`cat-toggle-status ${status}`}>
                                        {status === 'open' ? 'BUKA' : 'TUTUP'}
                                    </span>
                                </div>
                                <button 
                                    className={`toggle-btn ${status}`}
                                    onClick={() => {
                                        const newStatus = { ...categoryStatus, [cat]: status === 'open' ? 'closed' : 'open' };
                                        setCategoryStatus(newStatus);
                                        localStorage.setItem('warung_category_status', JSON.stringify(newStatus));
                                        // Keep auto-sync but add manual button for certainty
                                        pushToCloud(customProducts, newStatus);
                                    }}
                                >
                                    {status === 'open' ? 'Tutup Kategori' : 'Buka Kategori'}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className='status-save-footer'>
                        <p>* Status akan otomatis tersimpan, namun anda bisa klik tombol di bawah untuk memastikan.</p>
                        <button 
                            className="save-status-btn-manual" 
                            onClick={() => pushToCloud(customProducts, categoryStatus)}
                        >
                            SINKRONISASI STATUS KE GOOGLE/DATABASE ☁️
                        </button>
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
