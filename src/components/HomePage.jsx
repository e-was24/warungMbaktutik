import React, { useState, useEffect } from 'react'
import './HomePage.css'
import teaImg from '../assets/tea_series.png'
import yakultImg from '../assets/yakult_series.png'
import esTelerImg from '../assets/es_teler_new.png'
import mojitoImg from '../assets/mojito_new.png'
import alpukatImg from '../assets/alpukat_kocok_new.png'
import seblakSosisImg from '../assets/seblak_sosis.png'
import seblakSpesialImg from '../assets/seblak_spesial.png'
import seblakBlengerImg from '../assets/seblak_blenger.png'

// KONFIGURASI NOMOR WHATSAPP (Diambil dari file .env)
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '6281217819691';

const HomePage = ({ onAdminClick }) => {
    const [cart, setCart] = useState({});
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('minuman'); // 'minuman' or 'makanan'
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({ name: '', address: '' });
    const [adminClickCount, setAdminClickCount] = useState(0);

    const initialMinuman = [
        {
            category: 'TEA SERIES',
            id: 'tea',
            image: teaImg,
            mainPrice: 3000,
            items: [
                { name: 'LEMON TEA', price: 5000 },
                { name: 'LYCHEE TEA', price: 5000 },
                { name: 'MANGO TEA', price: 5000 },
                { name: 'STRAWBERRY TEA', price: 5000 },
                { name: 'GRAPE TEA', price: 5000 },
                { name: 'MELON TEA', price: 5000 },
            ],
            footer: 'JASMINE TEA'
        },
        {
            category: 'YAKULT SERIES',
            id: 'yakult',
            image: yakultImg,
            items: [
                { name: 'YAKULT STRAWBERRY', price: 8000 },
                { name: 'YAKULT ORANGE', price: 8000 },
                { name: 'YAKULT GRAPE', price: 8000 },
                { name: 'YAKULT LYCHEE', price: 8000 },
                { name: 'YAKULT MELON', price: 8000 },
            ]
        },
        {
            category: 'ES TELER',
            id: 'esteler',
            image: esTelerImg,
            items: [
                { name: 'ES TELER CREAMY', price: 10000 }
            ]
        },
        {
            category: 'MOJITO',
            id: 'mojito',
            image: mojitoImg,
            items: [
                { name: 'MOJITO STRAWBERRY', price: 8000 },
                { name: 'MOJITO LEMON', price: 8000 },
                { name: 'MOJITO MELON', price: 8000 },
                { name: 'MOJITO LYCHEE', price: 8000 },
                { name: 'MOJITO ORANGE', price: 8000 },
                { name: 'MOJITO GRAPE', price: 8000 },
            ]
        },
        {
            category: 'ALPUKAT KOCOK',
            id: 'alpukat',
            image: alpukatImg,
            items: [
                { name: 'ALPUKAT KOCOK ORIGINAL', price: 10000 },
                { name: 'ALPUKAT KOCOK MILO', price: 10000 },
                { name: 'ALPUKAT KOCOK + KEJU BERUTAL', price: 10000 },
                { name: 'ALPUKAT KOCOK + COKLAT + KEJU', price: 10000 },
                { name: 'ALPUKAT KOCOK + COKLAT PARUT', price: 10000 },
            ]
        }
    ];

    const initialMakanan = [
        {
            category: 'SEBLAK REGULER',
            id: 'seblak-reg',
            image: seblakSosisImg,
            items: [
                { name: 'SEBLAK SOSIS', price: 10000, desc: 'Sosis, Mie, Kerupuk, Sayur, Telur' },
                { name: 'SEBLAK BAKSO', price: 10000, desc: 'Bakso, Mie, Kerupuk, Sayur, Telur' },
                { name: 'SEBLAK HEMAT', price: 10000, desc: 'Bakso, Sosis, Mie, Kerupuk, Sayur, Telur' },
                { name: 'SEBLAK BIASA', price: 12000, desc: 'Sosis, Bakso, Dumpling, Mie, Kerupuk, Sayur, Telur' },
            ]
        },
        {
            category: 'SEBLAK PREMIUM',
            id: 'seblak-premium',
            image: seblakSpesialImg,
            items: [
                { name: 'SEBLAK CUANKI 🔥', price: 15000, desc: 'Cuanki, Telur, Pilus, Some kering' },
                { name: 'SEBLAK SPESIAL', price: 15000, desc: 'Sosis, Bakso, Dumpling, Mie, Kerupuk, Sayur, Telur, Kembang Cumi' },
                { name: 'SEBLAK ISTIMEWA', price: 20000, desc: 'Sosis, Bakso, Dumpling, Cuanki, Some, Enoki, Kembang Cumi, Cikuwa...' },
            ]
        },
        {
            category: 'EXTRA BLENGER',
            id: 'seblak-extra',
            image: seblakBlengerImg,
            items: [
                { name: 'SEBLAK BLENGER', price: 30000, desc: 'Porsi Super Lengkap: Sosis, Bakso, Dumpling, Cuanki, Enoki, Cikuwa, Jamur...' },
            ],
            footer: 'PRASMANAN MINIMAL 10K'
        }
    ];

    const [menuData, setMenuData] = useState({ minuman: initialMinuman, makanan: initialMakanan });

    useEffect(() => {
        const loadCustomProducts = () => {
            const custom = JSON.parse(localStorage.getItem('warung_custom_products') || '[]');
            
            // Group by name for the shop display
            const groupProducts = (items) => {
                const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
                const grouped = items.reduce((acc, p) => {
                    const name = p.name.toUpperCase();
                    if (!acc[name]) {
                        acc[name] = { 
                            category: name, 
                            id: `custom-${name}`, 
                            image: p.image || null,
                            items: [],
                            isNew: false
                        };
                    }
                    acc[name].items.push({ 
                        name: p.variant ? `${name} (${p.variant.toUpperCase()})` : name, 
                        price: p.price, 
                        id: p.id 
                    });
                    // Mark as NEW if added within last 3 days
                    if (p.id > threeDaysAgo) acc[name].isNew = true;
                    // Use the first image found for the group
                    if (!acc[name].image && p.image) acc[name].image = p.image;
                    return acc;
                }, {});
                return Object.values(grouped);
            };

            const customMinuman = groupProducts(custom.filter(p => p.category === 'minuman'));
            const customMakanan = groupProducts(custom.filter(p => p.category === 'makanan'));

            setMenuData({ 
                minuman: [...initialMinuman, ...customMinuman], 
                makanan: [...initialMakanan, ...customMakanan] 
            });
        };

        loadCustomProducts();
        window.addEventListener('storage', loadCustomProducts);
        return () => window.removeEventListener('storage', loadCustomProducts);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const activeMenuData = activeTab === 'minuman' ? menuData.minuman : menuData.makanan;

    const addToCart = (name, price) => {
        setCart(prev => ({
            ...prev,
            [name]: {
                name,
                price,
                quantity: (prev[name]?.quantity || 0) + 1
            }
        }));
    };

    const removeFromCart = (name) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[name]) {
                if (newCart[name].quantity > 1) {
                    newCart[name].quantity -= 1;
                } else {
                    delete newCart[name];
                }
            }
            return newCart;
        });
    };

    const getTotalPrice = () => {
        return Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const getTotalItems = () => {
        return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    };

    const sendToWhatsApp = () => {
        const phoneNumber = WHATSAPP_NUMBER;
        let message = `*Pesanan Baru - Warung Mbk Tutik*\n`;
        message += `----------------------------\n`;
        message += `👤 *Nama:* ${customerInfo.name}\n`;
        if (customerInfo.address) {
            message += `📍 *Alamat:* ${customerInfo.address}\n`;
        }
        message += `----------------------------\n\n`;
        
        Object.values(cart).forEach(item => {
            message += `- ${item.name} (${item.quantity}x) : Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
        });
        message += `\n*TOTAL: Rp ${getTotalPrice().toLocaleString('id-ID')}*`;
        
        const encodedMessage = encodeURIComponent(message);
        
        // Save to localStorage (Admin Tracking)
        const newOrder = {
            timestamp: new Date().toISOString(),
            customer: customerInfo,
            items: Object.values(cart),
            total: getTotalPrice()
        };
        const existingOrders = JSON.parse(localStorage.getItem('warung_orders') || '[]');
        existingOrders.push(newOrder);
        localStorage.setItem('warung_orders', JSON.stringify(existingOrders));

        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        setIsCheckoutOpen(false);
    };

    const handleCheckoutSubmit = (e) => {
        e.preventDefault();
        if (!customerInfo.name.trim()) {
            alert('Mohon masukkan nama Anda');
            return;
        }
        sendToWhatsApp();
    };

    const handleHeroClick = () => {
        const nextCount = adminClickCount + 1;
        setAdminClickCount(nextCount);

        if (nextCount === 3) {
            const password = window.prompt('Masukkan Password Admin:');
            const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
            
            if (password === adminPass) {
                onAdminClick();
            } else if (password !== null) {
                alert('Password Salah!');
            }
            setAdminClickCount(0);
        }

        // Reset count after 2 seconds of inactivity
        setTimeout(() => setAdminClickCount(0), 2000);
    };

    return (
        <div className={`home-page-premium ${activeTab}-active`}>
            <div className='decorative-blob blob-1'></div>
            <div className='decorative-blob blob-2'></div>
            
            <header className={`premium-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className='nav-content'>
                    <div className='nav-brand'>
                        <span className='brand-accent'>W</span>arung <span>M</span>bk Tutik
                    </div>
                    <div className='category-switcher'>
                        <button 
                            className={`switch-btn ${activeTab === 'minuman' ? 'active' : ''}`}
                            onClick={() => setActiveTab('minuman')}
                        >
                            🍹 Minuman
                        </button>
                        <button 
                            className={`switch-btn ${activeTab === 'makanan' ? 'active' : ''}`}
                            onClick={() => setActiveTab('makanan')}
                        >
                            🍜 Seblak
                        </button>
                    </div>
                </div>
            </header>

            <section className='premium-hero'>
                <div className='hero-badge'>
                    {activeTab === 'minuman' ? 'Fresh Snacks & Drinks' : 'Spicy & Authentic Seblak'}
                </div>
                <h1 className='hero-title' onClick={handleHeroClick}>
                    Cita Rasa <span className='text-gradient'>{activeTab === 'minuman' ? 'Autentik' : 'Pedas'}</span><br/>
                    Dalam Setiap <span className='text-gradient'>{activeTab === 'minuman' ? 'Gelas' : 'Suapan'}</span>
                </h1>
            </section>

            <main className='premium-menu-grid'>
                {activeMenuData.map((section, sIdx) => (
                    <div key={section.id} className='premium-card-wrapper fade-in-up' style={{animationDelay: `${sIdx * 0.1}s`}}>
                        <div className={`premium-card ${section.id}-theme`}>
                            <div className='card-visual-wrapper'>
                                {section.image ? (
                                    <img src={section.image} alt={section.category} className='card-main-img' />
                                ) : (
                                    <div className='card-img-placeholder'>{section.category[0]}</div>
                                )}
                                <div className='card-category-tag'>{section.category}</div>
                                {section.isNew && <div className='new-product-badge'>NEW</div>}
                            </div>
                            
                            <div className='card-content'>
                                {section.mainPrice && (
                                    <div className='featured-item'>
                                        <div className='featured-info'>
                                            <span className='featured-name'>{section.footer}</span>
                                            <span className='featured-price'>Rp {(section.mainPrice).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className='premium-controls'>
                                            {cart[section.footer] && (
                                                <>
                                                    <button className='p-btn p-remove' onClick={() => removeFromCart(section.footer)}>−</button>
                                                    <span className='p-qty'>{cart[section.footer].quantity}</span>
                                                </>
                                            )}
                                            <button className='p-btn p-add' onClick={() => addToCart(section.footer, section.mainPrice)}>+</button>
                                        </div>
                                    </div>
                                )}

                                <div className='item-list-premium'>
                                    {section.items.map((item, idx) => (
                                        <div key={idx} className='premium-item-row'>
                                            <div className='p-item-info'>
                                                <span className='p-item-name'>{item.name}</span>
                                                {item.desc && <span className='p-item-desc'>{item.desc}</span>}
                                                <span className='p-item-price'>Rp {(item.price).toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className='premium-controls'>
                                                {cart[item.name] && (
                                                    <>
                                                        <button className='p-btn p-remove' onClick={() => removeFromCart(item.name)}>−</button>
                                                        <span className='p-qty'>{cart[item.name].quantity}</span>
                                                    </>
                                                )}
                                                <button className='p-btn p-add' onClick={() => addToCart(item.name, item.price)}>+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {section.footer && !section.mainPrice && (
                                    <div className='card-footer-note'>{section.footer}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {getTotalItems() > 0 && (
                <div className='premium-cart-pill fade-up'>
                    <div className='pill-info'>
                        <div className='pill-icon'>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M6 6h15l-1.5 9h-13l-1.5-11h-3" />
                                <circle cx="9" cy="20" r="1.5" />
                                <circle cx="17" cy="20" r="1.5" />
                            </svg>
                            <span className='pill-badge'>{getTotalItems()}</span>
                        </div>
                        <div className='pill-text'>
                            <span className='pill-label'>Total Pesanan</span>
                            <span className='pill-amount'>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                    <button className='pill-action-btn' onClick={() => setIsCheckoutOpen(true)}>
                        Check Out <span className='wa-icon'>↗</span>
                    </button>
                </div>
            )}

            <footer className='premium-footer'>
                <div className='footer-line'></div>
                <div className='footer-brand'>WARUNG MBK TUTIK</div>
                <div className='footer-contact'>+{WHATSAPP_NUMBER}</div>
                <div className='footer-legal'>
                    &copy; 2026 Crafted with Excellence
                </div>
            </footer>

            {/* Checkout Modal */}
            {isCheckoutOpen && (
                <div className='checkout-modal-overlay' onClick={() => setIsCheckoutOpen(false)}>
                    <div className='checkout-modal-card' onClick={e => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h2>Konfirmasi Pesanan</h2>
                            <button className='close-modal' onClick={() => setIsCheckoutOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCheckoutSubmit} className='checkout-form'>
                            <div className='form-group'>
                                <label>Nama Pembeli *</label>
                                <input 
                                    type='text' 
                                    placeholder='Masukkan nama lengkap'
                                    required
                                    value={customerInfo.name}
                                    onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                />
                            </div>
                            <div className='form-group'>
                                <label>Alamat Pengiriman (Opsional)</label>
                                <textarea 
                                    placeholder='Masukkan alamat detail jika ingin diantar'
                                    value={customerInfo.address}
                                    onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                                />
                            </div>
                            <div className='modal-total'>
                                <span>Total Tagihan:</span>
                                <strong>Rp {getTotalPrice().toLocaleString('id-ID')}</strong>
                            </div>
                            <button type='submit' className='submit-order-btn'>
                                Kirim ke WhatsApp →
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HomePage