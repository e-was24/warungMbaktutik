import React, { useState, useEffect } from 'react';
import './WelcomePopup.css';

const WelcomePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const title = "WARUNG MBAK TUTIK";

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    // Logic: Always show on mobile refresh, show once on desktop
    if (window.innerWidth <= 768 || !hasSeenWelcome) {
      setIsVisible(true);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let timer;
    if (isVisible && isMobile && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isVisible && isMobile && countdown === 0) {
      setIsVisible(false);
    }
    return () => clearInterval(timer);
  }, [isVisible, isMobile, countdown]);

  const handleClose = () => {
    setIsVisible(false);
    if (!isMobile) {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-modal">
        <div className="welcome-content">
          <div className="welcome-logo">
            <svg viewBox="0 0 100 100" className="logo-svg">
              {/* Plate */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" className="draw-circle" />
              <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              
              {/* Crossed Fork and Spoon - Perfectly Centered */}
              <g className="crossed-cutlery">
                {/* Spoon Group */}
                <g className="spoon-group" transform="translate(55, 55) rotate(-45)">
                  <path d="M0 -30 L0 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="0" cy="-30" rx="7" ry="10" fill="currentColor" />
                </g>
                
                {/* Fork Group */}
                <g className="fork-group" transform="translate(55, 45) rotate(45)">
                  {/* Handle */}
                  <path d="M0 -15 L0 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  {/* Fork Head Base (The "U" shape) */}
                  <path d="M-6 -15 Q-6 -5 0 -5 Q6 -5 6 -15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  {/* 3 Prongs */}
                  <path d="M-6 -15 L-6 -25 M0 -15 L0 -25 M6 -15 L6 -25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              </g>
            </svg>
          </div>
          
          <h1 className="animated-title">
            {title.split("").map((char, index) => (
              <span key={index} style={{ animationDelay: `${index * 0.05 + 0.5}s` }}>
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
          
          <p className="fade-in-text">
            Sajian istimewa dengan cita rasa autentik. 
            Selamat datang di pengalaman kuliner terbaik kami.
          </p>
          
          {isMobile ? (
            <div className="welcome-countdown">
              Menuju menu pilihan dalam <span>{countdown}</span> detik...
            </div>
          ) : (
            <button className="welcome-button" onClick={handleClose}>
              Mulai Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
