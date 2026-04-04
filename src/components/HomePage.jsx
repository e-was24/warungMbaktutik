import React, { useState, useEffect } from "react";
import "./HomePage.css";
import drinkHeroBg from "../assets/welcome_bg.png";
import foodHeroBg from "../assets/seblak_hero.png";
import bakaranHeroBg from "../assets/bakaran_hero.png";
import fashionHeroBg from "../assets/fashion_hero.png";

// KONFIGURASI NOMOR WHATSAPP (Diambil dari file .env)
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "6281217819691";

const HomePage = ({ onAdminClick }) => {
  const [cart, setCart] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("minuman"); // 'minuman', 'makanan', 'bakaran', or 'fashion'
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: "", address: "" });
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categoryStatus, setCategoryStatus] = useState({
    minuman: 'open',
    makanan: 'open',
    bakaran: 'open',
    fashion: 'open'
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

      const storedStatus = JSON.parse(localStorage.getItem('warung_category_status') || '{}');
      if (Object.keys(storedStatus).length > 0) {
        setCategoryStatus(prev => ({ ...prev, ...storedStatus }));
      }
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

          localStorage.setItem(
            "warung_custom_products",
            JSON.stringify(cloudProducts),
          );
        }
      } catch (err) {
        console.warn("Cloud Sync Offline:", err);
      }
    };

    fetchCloudData();

    window.addEventListener("storage", loadCustomProducts);
    return () => window.removeEventListener("storage", loadCustomProducts);
  }, []);

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

    // Save to localStorage (Admin Tracking)
    const newOrder = {
      timestamp: new Date().toISOString(),
      customer: customerInfo,
      items: Object.values(cart),
      total: getTotalPrice(),
    };
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
    const nextCount = adminClickCount + 1;
    setAdminClickCount(nextCount);

    if (nextCount === 3) {
      const password = window.prompt("Masukkan Password Admin:");
      const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

      if (password === adminPass) {
        onAdminClick();
      } else if (password !== null) {
        alert("Password Salah!");
      }
      setAdminClickCount(0);
    }

    // Reset count after 2 seconds of inactivity
    setTimeout(() => setAdminClickCount(0), 2000);
  };

  return (
    <div className={`home-page-premium ${activeTab}-active`}>
      <div className="decorative-blob blob-1"></div>
      <div className="decorative-blob blob-2"></div>

      <header className={`premium-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-content">
          <div className="nav-brand">
            <span className="brand-accent">W</span>arung <span>M</span>bk Tutik
          </div>
          <div className="category-switcher">
            <button
              className={`switch-btn ${activeTab === "minuman" ? "active" : ""} ${categoryStatus.minuman === 'closed' ? 'is-closed' : ''}`}
              onClick={() => categoryStatus.minuman === 'open' && setActiveTab("minuman")}
              disabled={categoryStatus.minuman === 'closed'}
            >
              🍹 Minuman {categoryStatus.minuman === 'closed' && <span className="closed-badge">CLOSED</span>}
            </button>
            <button
              className={`switch-btn ${activeTab === "makanan" ? "active" : ""} ${categoryStatus.makanan === 'closed' ? 'is-closed' : ''}`}
              onClick={() => categoryStatus.makanan === 'open' && setActiveTab("makanan")}
              disabled={categoryStatus.makanan === 'closed'}
            >
              🍜 Seblak {categoryStatus.makanan === 'closed' && <span className="closed-badge">CLOSED</span>}
            </button>
            <button
              className={`switch-btn ${activeTab === "bakaran" ? "active" : ""} ${categoryStatus.bakaran === 'closed' ? 'is-closed' : ''}`}
              onClick={() => categoryStatus.bakaran === 'open' && setActiveTab("bakaran")}
              disabled={categoryStatus.bakaran === 'closed'}
            >
              🔥 Bakaran {categoryStatus.bakaran === 'closed' && <span className="closed-badge">CLOSED</span>}
            </button>
            <button
              className={`switch-btn ${activeTab === "fashion" ? "active" : ""} ${categoryStatus.fashion === 'closed' ? 'is-closed' : ''}`}
              onClick={() => categoryStatus.fashion === 'open' && setActiveTab("fashion")}
              disabled={categoryStatus.fashion === 'closed'}
            >
              👗 Fashion {categoryStatus.fashion === 'closed' && <span className="closed-badge">CLOSED</span>}
            </button>
          </div>
          <div className={`premium-search-wrapper ${isSearchOpen ? 'expanded' : 'collapsed'}`}>
            <button className="mobile-search-toggle" onClick={() => setIsSearchOpen(!isSearchOpen)}>
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
          &copy; {new Date().getFullYear()} Lanova Tech. all rights reserved.
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
