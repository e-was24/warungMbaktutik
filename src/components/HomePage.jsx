import React, { useState, useEffect } from "react";
import "./HomePage.css";
import drinkHeroBg from "../assets/welcome_bg.png";
import foodHeroBg from "../assets/seblak_hero.png";
import bakaranHeroBg from "../assets/bakaran_hero.png";
import fashionHeroBg from "../assets/fashion_hero.png";

// KONFIGURASI NOMOR WHATSAPP (Diambil dari file .env)
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "6281217819691";

const HomePage = ({ onAdminClick }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cart, setCart] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("minuman"); // 'minuman', 'makanan', 'bakaran', or 'fashion'
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: "", address: "" });
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryStatus, setCategoryStatus] = useState({
    minuman: { status: 'open', lastUpdated: Date.now() },
    makanan: { status: 'open', lastUpdated: Date.now() },
    bakaran: { status: 'open', lastUpdated: Date.now() },
    fashion: { status: 'open', lastUpdated: Date.now() }
  });
  const [autoSchedule, setAutoSchedule] = useState({
    enabled: false,
    openTime: '09:00',
    closeTime: '19:00'
  });

  const [menuData, setMenuData] = useState({
    minuman: [],
    makanan: [],
    bakaran: [],
    fashion: [],
  });

  useEffect(() => {
    // Unified grouping logic with premium fallbacks
    const groupProducts = (items, type) => {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const grouped = items.reduce((acc, p) => {
        const name = p.name.toUpperCase();
        if (!acc[name]) {
          acc[name] = {
            category: name,
            id: `custom-${name}`,
            image: null,
            items: [],
            isNew: false,
            newUntil: 0
          };
        }
        acc[name].items.push({
          name: p.variant ? `${name} (${p.variant.toUpperCase()})` : name,
          price: p.price,
          id: p.id,
        });
        
        if (p.id > oneDayAgo) {
          acc[name].isNew = true;
          const expiry = p.id + (24 * 60 * 60 * 1000);
          if (expiry > acc[name].newUntil) acc[name].newUntil = expiry;
        }
        
        // Prioritize actual external image URLs (Vercel Blob, etc)
        const hasExternalImage = p.image && (p.image.startsWith('http') || p.image.startsWith('data:'));
        if (hasExternalImage) {
          acc[name].image = p.image;
        }
        
        return acc;
      }, {});
      
      // Final pass: Apply category fallbacks for groups still missing a custom image
      return Object.values(grouped).map(group => ({
        ...group,
        image: group.image || (type === "minuman" ? drinkHeroBg : (type === "makanan" ? foodHeroBg : (type === "bakaran" ? bakaranHeroBg : fashionHeroBg)))
      }));
    };

    const loadCustomProducts = () => {
      const custom = JSON.parse(
        localStorage.getItem("warung_custom_products") || "[]",
      );

      const customMinuman = groupProducts(
        custom.filter((p) => p.category === "minuman"),
        "minuman"
      );
      const customMakanan = groupProducts(
        custom.filter((p) => p.category === "makanan"),
        "makanan"
      );
      const customBakaran = groupProducts(
        custom.filter((p) => p.category === "bakaran"),
        "bakaran"
      );
      const customFashion = groupProducts(
        custom.filter((p) => p.category === "fashion"),
        "fashion"
      );

      setMenuData({
        minuman: customMinuman,
        makanan: customMakanan,
        bakaran: customBakaran,
        fashion: customFashion,
      });

      const storedSchedule = JSON.parse(localStorage.getItem('warung_auto_schedule') || '{}');
      if (storedSchedule.enabled !== undefined) setAutoSchedule(storedSchedule);
    };

    loadCustomProducts();

    // Cloud Sync Fetch (Integrated Vercel KV)
    const fetchCloudData = async () => {
      try {
        const res = await fetch(`/api/sync?t=${Date.now()}`);
        if (!res.ok) return;
        const cloudData = await res.json();

        // Support legacy array and new object format
        const cloudProducts = Array.isArray(cloudData)
          ? cloudData
          : cloudData.products || [];

        if (Array.isArray(cloudProducts)) {
          const cloudMinuman = groupProducts(
            cloudProducts.filter((p) => p.category === "minuman"),
            "minuman"
          );
          const cloudMakanan = groupProducts(
            cloudProducts.filter((p) => p.category === "makanan"),
            "makanan"
          );
          const cloudBakaran = groupProducts(
            cloudProducts.filter((p) => p.category === "bakaran"),
            "bakaran"
          );
          const cloudFashion = groupProducts(
            cloudProducts.filter((p) => p.category === "fashion"),
            "fashion"
          );

          setMenuData({
            minuman: cloudMinuman,
            makanan: cloudMakanan,
            bakaran: cloudBakaran,
            fashion: cloudFashion,
          });

          if (cloudData.categoryStatus) {
            setCategoryStatus(cloudData.categoryStatus);
            localStorage.setItem('warung_category_status', JSON.stringify(cloudData.categoryStatus));
          }

          if (cloudData.orders) {
            localStorage.setItem('warung_orders', JSON.stringify(cloudData.orders));
          }

          if (cloudData.autoSchedule) {
            setAutoSchedule(cloudData.autoSchedule);
            localStorage.setItem('warung_auto_schedule', JSON.stringify(cloudData.autoSchedule));
          }
        }
      } catch (err) {
        console.warn("Cloud Sync Offline:", err);
      }
    };

    fetchCloudData();

    // Check for updates every 10 seconds
    const interval = setInterval(fetchCloudData, 10000);

    window.addEventListener("storage", loadCustomProducts);
    return () => {
      window.removeEventListener("storage", loadCustomProducts);
      clearInterval(interval);
    };
  }, []);

  // Auto-switch away from CLOSED categories
  useEffect(() => {
    const isClosed = (cat) => {
        const data = categoryStatus[cat];
        return typeof data === 'string' ? data === 'closed' : data?.status === 'closed';
    };

    if (isClosed(activeTab)) {
      const firstOpen = Object.entries(categoryStatus).find(([cat, data]) => {
        const status = typeof data === 'string' ? data : data.status;
        return status === 'open';
      });
      if (firstOpen) {
        setActiveTab(firstOpen[0]);
      }
    }
  }, [categoryStatus, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusString = (cat) => {
    const data = categoryStatus[cat];
    let status = typeof data === 'string' ? data : data?.status;

    // Auto-Schedule Override
    if (autoSchedule.enabled) {
      const now = new Date();
      const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentStr < autoSchedule.openTime || currentStr >= autoSchedule.closeTime) {
        status = 'closed';
      }
    }
    return status;
  };

  const isAllClosed = ['minuman', 'makanan', 'bakaran', 'fashion'].every(cat => getStatusString(cat) === 'closed');

  useEffect(() => {
    if (adminClickCount >= 3) {
      const password = window.prompt("Masukkan Password Admin:");
      const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

      if (password === adminPass) {
        onAdminClick();
      } else if (password !== null) {
        alert("Password Salah!");
      }
      setAdminClickCount(0);
      return;
    }

    if (adminClickCount > 0) {
        const timer = setTimeout(() => setAdminClickCount(0), 2000);
        return () => clearTimeout(timer);
    }
  }, [adminClickCount, onAdminClick]);

  const activeMenuData =
    activeTab === "minuman" ? menuData.minuman : (activeTab === "makanan" ? menuData.makanan : (activeTab === "bakaran" ? menuData.bakaran : menuData.fashion));

  const filteredMenuData = activeMenuData.map(section => {
    // Filter items within the section
    const filteredItems = section.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.desc && item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // If the section name matches the search term, show ALL items in that section
    const sectionMatches = section.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return {
      ...section,
      items: sectionMatches ? section.items : filteredItems,
      isVisible: sectionMatches || filteredItems.length > 0
    };
  }).filter(section => section.isVisible);

  const getCountdown = (targetTime) => {
    const diff = targetTime - currentTime.getTime();
    if (diff <= 0) return null;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h}j ${m}m ${s < 10 ? '0'+s : s}d`;
  };

  const addToCart = (name, price) => {
    setCart((prev) => ({
      ...prev,
      [name]: {
        name,
        price,
        quantity: (prev[name]?.quantity || 0) + 1,
      },
    }));
  };

  const removeFromCart = (name) => {
    setCart((prev) => {
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
    return Object.values(cart).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
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

    Object.values(cart).forEach((item) => {
      message += `- ${item.name} (${item.quantity}x) : Rp ${(item.price * item.quantity).toLocaleString("id-ID")}\n`;
    });
    message += `\n*TOTAL: Rp ${getTotalPrice().toLocaleString("id-ID")}*`;

    const encodedMessage = encodeURIComponent(message);

    // Save to Cloud (Database)
    const newOrder = {
      timestamp: new Date().toISOString(),
      customer: customerInfo,
      items: Object.values(cart),
      total: getTotalPrice(),
      status: 'success'
    };

    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'add_order',
        order: newOrder
      })
    }).catch(err => console.warn("Cloud Order Sync Failed:", err));

    // Fallback to localStorage (Admin Tracking - local only)
    const existingOrders = JSON.parse(
      localStorage.getItem("warung_orders") || "[]",
    );
    existingOrders.push(newOrder);
    localStorage.setItem("warung_orders", JSON.stringify(existingOrders));

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank",
    );
    setIsCheckoutOpen(false);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!customerInfo.name.trim()) {
      alert("Mohon masukkan nama Anda");
      return;
    }
    sendToWhatsApp();
  };

  const handleHeroClick = () => {
    // Only used for aesthetic now, as nav-brand handles the logic
    setAdminClickCount(prev => prev + 1);
  };

  if (isAllClosed) {
    return (
      <div className="home-page-premium">
        <div className="decorative-blob blob-1"></div>
        <div className="decorative-blob blob-2"></div>
        
        <header className="premium-nav">
          <div className="nav-content">
            <div className="nav-brand" onClick={() => setAdminClickCount(c => c + 1)}>
              <span className="brand-accent">W</span>arung <span>M</span>bk Tutik
            </div>
          </div>
        </header>

        <main className="warung-tutup-container">
          <div className="tutup-glass-card">
            <div className="tutup-icon">🚪</div>
            <h1 className="tutup-title">Waduh, Warung Tutup Nih!</h1>
            <p className="tutup-message">
              Klik balik lagi besok yaa, atau pantau terus sosial media kami untuk info buka kembali!
            </p>
            <div className="tutup-tagline">Rasa Autentik, Harga Ekonomis.</div>
            <div className="tutup-social">
              <span>Follow us for updates: @warungmbktutik</span>
            </div>
          </div>
        </main>

        <footer className="unified-footer">
          <div className="footer-content">
            <p>© 2024 Warung Mbk Tutik. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className={`home-page-premium ${activeTab}-active`}>
      <div className="decorative-blob blob-1"></div>
      <div className="decorative-blob blob-2"></div>

      <header className={`premium-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-content">
          <button className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="menu-toggle-svg">
              <line x1="2" y1="12" x2="22" y2="12" className="hb-line-1" />
              <line x1="2" y1="12" x2="22" y2="12" className="hb-line-2" />
              <line x1="2" y1="12" x2="22" y2="12" className="hb-line-3" />
            </svg>
          </button>

          <div className="nav-brand" onClick={() => setAdminClickCount(c => c + 1)}>
            <span className="brand-accent">W</span>arung <span>M</span>bk Tutik
          </div>

          <div className="category-switcher">
            <button
              className={`switch-btn ${activeTab === "minuman" ? "active" : ""} ${(categoryStatus.minuman?.status || categoryStatus.minuman) === 'closed' ? 'is-closed' : ''}`}
              onClick={() => (categoryStatus.minuman?.status || categoryStatus.minuman) === 'open' && setActiveTab("minuman")}
              disabled={(categoryStatus.minuman?.status || categoryStatus.minuman) === 'closed'}
            >
              🍹 Minuman {(categoryStatus.minuman?.status || categoryStatus.minuman) === 'closed' && (
                <span className="closed-icon-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              )}
            </button>
            <button
              className={`switch-btn ${activeTab === "makanan" ? "active" : ""} ${(categoryStatus.makanan?.status || categoryStatus.makanan) === 'closed' ? 'is-closed' : ''}`}
              onClick={() => (categoryStatus.makanan?.status || categoryStatus.makanan) === 'open' && setActiveTab("makanan")}
              disabled={(categoryStatus.makanan?.status || categoryStatus.makanan) === 'closed'}
            >
              🍜 Seblak {(categoryStatus.makanan?.status || categoryStatus.makanan) === 'closed' && (
                <span className="closed-icon-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              )}
            </button>
            <button
              className={`switch-btn ${activeTab === "bakaran" ? "active" : ""} ${(categoryStatus.bakaran?.status || categoryStatus.bakaran) === 'closed' ? 'is-closed' : ''}`}
              onClick={() => (categoryStatus.bakaran?.status || categoryStatus.bakaran) === 'open' && setActiveTab("bakaran")}
              disabled={(categoryStatus.bakaran?.status || categoryStatus.bakaran) === 'closed'}
            >
              🔥 Bakaran {(categoryStatus.bakaran?.status || categoryStatus.bakaran) === 'closed' && (
                <span className="closed-icon-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              )}
            </button>
            <button
              className={`switch-btn ${activeTab === "fashion" ? "active" : ""} ${(categoryStatus.fashion?.status || categoryStatus.fashion) === 'closed' ? 'is-closed' : ''}`}
              onClick={() => (categoryStatus.fashion?.status || categoryStatus.fashion) === 'open' && setActiveTab("fashion")}
              disabled={(categoryStatus.fashion?.status || categoryStatus.fashion) === 'closed'}
            >
              👗 Fashion {(categoryStatus.fashion?.status || categoryStatus.fashion) === 'closed' && (
                <span className="closed-icon-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              )}
            </button>
          </div>

          <div className={`premium-search-wrapper desktop-only ${isSearchOpen ? 'expanded' : 'collapsed'}`}>
            <button className="mobile-search-toggle" style={{ display: 'none' }} onClick={() => setIsSearchOpen(!isSearchOpen)}>
              {isSearchOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              )}
            </button>
            <div className="search-input-container">
              <div className="search-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input 
                type="text" 
                className="premium-search-input" 
                placeholder={`Cari ${activeTab === 'minuman' ? 'minuman' : (activeTab === 'makanan' ? 'seblak' : (activeTab === 'bakaran' ? 'bakaran' : 'fashion'))}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm("")}>&times;</button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <aside className={`mobile-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-accent">W</span>arung <span>M</span>bk Tutik
          </div>
          <button className={`mobile-menu-toggle sidebar-toggle-btn ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="menu-toggle-svg">
              <line x1="2" y1="12" x2="22" y2="12" className="hb-line-1" />
              <line x1="2" y1="12" x2="22" y2="12" className="hb-line-2" />
              <line x1="2" y1="12" x2="22" y2="12" className="hb-line-3" />
            </svg>
          </button>
        </div>

        <div className="sidebar-search-box">
          <div className="sidebar-search-input-wrapper">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sidebar-search-icon">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
             </svg>
             <input 
               type="text" 
               className="sidebar-search-input"
               placeholder="Cari Menu..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             {searchTerm && (
               <button className="sidebar-clear-search" onClick={() => setSearchTerm("")}>&times;</button>
             )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${activeTab === 'minuman' ? 'active' : ''} ${(categoryStatus.minuman?.status || categoryStatus.minuman) === 'closed' ? 'is-closed' : ''}`}
            onClick={() => { if((categoryStatus.minuman?.status || categoryStatus.minuman) === 'open') { setActiveTab('minuman'); setIsMenuOpen(false); } }}
          >
            <span className="link-icon">🍹</span>
            <span className="link-text">Minuman</span>
            {(categoryStatus.minuman?.status || categoryStatus.minuman) === 'closed' && <span className="closed-icon-badge small"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>}
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'makanan' ? 'active' : ''} ${(categoryStatus.makanan?.status || categoryStatus.makanan) === 'closed' ? 'is-closed' : ''}`}
            onClick={() => { if((categoryStatus.makanan?.status || categoryStatus.makanan) === 'open') { setActiveTab('makanan'); setIsMenuOpen(false); } }}
          >
            <span className="link-icon">🍜</span>
            <span className="link-text">Seblak Prasmanan</span>
            {(categoryStatus.makanan?.status || categoryStatus.makanan) === 'closed' && <span className="closed-icon-badge small"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>}
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'bakaran' ? 'active' : ''} ${(categoryStatus.bakaran?.status || categoryStatus.bakaran) === 'closed' ? 'is-closed' : ''}`}
            onClick={() => { if((categoryStatus.bakaran?.status || categoryStatus.bakaran) === 'open') { setActiveTab('bakaran'); setIsMenuOpen(false); } }}
          >
            <span className="link-icon">🔥</span>
            <span className="link-text">Bakaran</span>
            {(categoryStatus.bakaran?.status || categoryStatus.bakaran) === 'closed' && <span className="closed-icon-badge small"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>}
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'fashion' ? 'active' : ''} ${(categoryStatus.fashion?.status || categoryStatus.fashion) === 'closed' ? 'is-closed' : ''}`}
            onClick={() => { if((categoryStatus.fashion?.status || categoryStatus.fashion) === 'open') { setActiveTab('fashion'); setIsMenuOpen(false); } }}
          >
            <span className="link-icon">👗</span>
            <span className="link-text">Fashion</span>
            {(categoryStatus.fashion?.status || categoryStatus.fashion) === 'closed' && <span className="closed-icon-badge small"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>}
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="footer-legal-sidebar">
            <p>&copy; {new Date().getFullYear()} Warung Mbk Tutik.</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </aside>

      <section className="premium-hero">
        <div
          className="hero-bg-faded"
          style={{
            backgroundImage: `url(${activeTab === "minuman" ? drinkHeroBg : (activeTab === "makanan" ? foodHeroBg : (activeTab === "bakaran" ? bakaranHeroBg : fashionHeroBg))})`,
          }}
        ></div>
        <div className="hero-badge">
          {activeTab === "minuman"
            ? "Fresh Snacks & Drinks"
            : (activeTab === "makanan" ? "Spicy & Authentic Seblak" : (activeTab === "bakaran" ? "Grilled Gourmet Treats" : "Premium Fashion Collection"))}
        </div>
        <h1 className="hero-title" onClick={handleHeroClick}>
          Cita Rasa{" "}
          <span className="text-gradient">
            {activeTab === "minuman" ? "Autentik" : "Pedas"}
          </span>
          <br />
          Dalam Setiap{" "}
          <span className="text-gradient">
            {activeTab === "minuman" ? "Gelas" : (activeTab === "makanan" ? "Suapan" : (activeTab === "bakaran" ? "Gigitan" : "Gaya"))}
          </span>
        </h1>
      </section>

      {activeTab === "makanan" && (
        <div className="prasmanan-banner fade-in-up">
          <div className="prasmanan-icon">🔥</div>
          <div className="prasmanan-text">
            <span className="prasmanan-title">SEBLAK PRASMANAN</span>
            <span className="prasmanan-desc">Ambil Sendiri Isian Serumu! <strong>Minimal Rp 10.000</strong></span>
          </div>
        </div>
      )}

      <main className="premium-menu-grid">
        {filteredMenuData.length === 0 ? (
          <div className="search-empty-state fade-in-up">
            <div className="empty-icon">🔍</div>
            <h3>Menu Tidak Ditemukan</h3>
            <p>Coba gunakan kata kunci lain untuk menemukan {activeTab === 'minuman' ? 'minuman' : (activeTab === 'makanan' ? 'seblak' : (activeTab === 'bakaran' ? 'bakaran' : 'fashion'))} favoritmu.</p>
            <button className="reset-search-btn" onClick={() => setSearchTerm("")}>Lihat Semua Menu</button>
          </div>
        ) : (
          filteredMenuData.map((section, sIdx) => (
            <div
              key={section.id}
              className="premium-card-wrapper fade-in-up"
              style={{ animationDelay: `${sIdx * 0.1}s` }}
            >
            <div className={`premium-card ${section.id}-theme`}>
              <div className="card-visual-wrapper">
                <img
                  src={section.image}
                  alt={section.category}
                  className="card-main-img"
                />
                <div className="card-category-tag">{section.category}</div>
                {section.isNew && <div className="new-product-badge">NEW</div>}
              </div>

              <div className="card-content">
                {section.mainPrice && (
                  <div className="featured-item">
                    <div className="featured-info">
                      <span className="featured-name">{section.footer}</span>
                      <span className="featured-price">
                        Rp {section.mainPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="premium-controls">
                      {cart[section.footer] && (
                        <>
                          <button
                            className="p-btn p-remove"
                            onClick={() => removeFromCart(section.footer)}
                          >
                            −
                          </button>
                          <span className="p-qty">
                            {cart[section.footer].quantity}
                          </span>
                        </>
                      )}
                      <button
                        className="p-btn p-add"
                        onClick={() =>
                          addToCart(section.footer, section.mainPrice)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="item-list-premium">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="premium-item-row">
                      <div className="p-item-info">
                        <span className="p-item-name">{item.name}</span>
                        {item.desc && (
                          <span className="p-item-desc">{item.desc}</span>
                        )}
                        <span className="p-item-price">
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="premium-controls">
                        {cart[item.name] && (
                          <>
                            <button
                              className="p-btn p-remove"
                              onClick={() => removeFromCart(item.name)}
                            >
                              −
                            </button>
                            <span className="p-qty">
                              {cart[item.name].quantity}
                            </span>
                          </>
                        )}
                        <button
                          className="p-btn p-add"
                          onClick={() => addToCart(item.name, item.price)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {section.footer && !section.mainPrice && (
                  <div className="card-footer-note">{section.footer}</div>
                )}
              </div>
            </div>
          </div>
        )))}
      </main>

      {getTotalItems() > 0 && (
        <div className="premium-cart-pill fade-up">
          <div className="pill-info">
            <div className="pill-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 6h15l-1.5 9h-13l-1.5-11h-3" />
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="17" cy="20" r="1.5" />
              </svg>
              <span className="pill-badge">{getTotalItems()}</span>
            </div>
            <div className="pill-text">
              <span className="pill-label">Total Pesanan</span>
              <span className="pill-amount">
                Rp {getTotalPrice().toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <button
            className="pill-action-btn"
            onClick={() => setIsCheckoutOpen(true)}
          >
            Check Out <span className="wa-icon">↗</span>
          </button>
        </div>
      )}

      <footer className="premium-footer">
        <div className="footer-line"></div>
        <div className="footer-brand">WARUNG MBK TUTIK</div>
        <div className="footer-contact">
          <span>+{WHATSAPP_NUMBER}</span>
          <span className="live-clock">
            {currentTime.toLocaleTimeString("id-ID", { hour12: false })} WIB
          </span>
        </div>
        <div className="footer-legal">
          &copy; {new Date().getFullYear()} Warung Mbk Tutik. All rights reserved.
        </div>
      </footer>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div
          className="checkout-modal-overlay"
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div
            className="checkout-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Konfirmasi Pesanan</h2>
              <button
                className="close-modal"
                onClick={() => setIsCheckoutOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="checkout-form">
              <div className="form-group">
                <label>Nama Pembeli *</label>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  required
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Alamat Pengiriman (Opsional)</label>
                <textarea
                  placeholder="Masukkan alamat detail jika ingin diantar"
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-total">
                <span>Total Tagihan:</span>
                <strong>Rp {getTotalPrice().toLocaleString("id-ID")}</strong>
              </div>
              <button type="submit" className="submit-order-btn">
                Kirim ke WhatsApp →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
