'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function Page() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const [systemInfo, setSystemInfo] = useState({
    leftColumn: {},
    rightColumn: {}
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const updateSystemInfo = () => {
      const platform = navigator.platform;
      const browserInfo = navigator.userAgent.split(' ').pop();
      const osInfo = platform;
      
      const memory = navigator.deviceMemory 
        ? `RAM: ${navigator.deviceMemory}GB` 
        : '';

      const screenSize = `Resolution: ${window.screen.width}x${window.screen.height}`;
      const colorDepth = `Color Depth: ${window.screen.colorDepth}-bit`;
      const connection = navigator.connection?.effectiveType 
        ? `Network: ${navigator.connection.effectiveType}` 
        : '';

      setSystemInfo({
        leftColumn: {
          os: `OS: ${osInfo}`,
          browser: `Browser: ${browserInfo}`,
          screen: screenSize
        },
        rightColumn: {
          memory,
          colorDepth,
          connection
        }
      });
    };

    updateSystemInfo();
    window.addEventListener('resize', updateSystemInfo);
    return () => window.removeEventListener('resize', updateSystemInfo);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        router.push('/');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleJoinTelegram();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleJoinTelegram = () => {
    window.open('https://t.me/+Zk7wYLCOt5UyMDgx', '_blank');
  };

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="header-title">COMMUNITY.DAT - O(n) Club</div>
        <div className="header-info">
          <div className="info-columns">
            <div className="info-column">
              {Object.values(systemInfo.leftColumn || {}).filter(Boolean).join(' | ')}
            </div>
            <div className="info-column">
              {Object.values(systemInfo.rightColumn || {}).filter(Boolean).join(' | ')}
            </div>
          </div>
        </div>
      </div>
      <div className="terminal-content">
        <div className="command-line">
          Directory listing of COMMUNITY.DAT
        </div>
        <div className="command-line">
          Press ENTER to join Telegram, ESC to return
        </div>
        <div className="command-line">
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        </div>
        
        <div className="directory-listing telegram-community">
          <div className="text-line">
            X Tech/Entrepreneurship pero en Telegram, promovido por fundadores de O(n) Club.
          </div>
          <div className="text-line">
            Queremos crear una comunidad HIGH END de gente interesada en tecnología, emprendimiento y startups.
          </div>
          <div className="command-line">
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          </div>
          <div className="text-line">
            Características:
          </div>
          <div className="text-line">
            &gt; Discusiones de alto nivel
          </div>
          <div className="text-line">
            &gt; Apoyo de la comunidad
          </div>
          <div className="text-line">
            &gt; Anuncios de eventos
          </div>
          <div className="text-line">
            &gt; Oportunidades de networking
          </div>
          <div className="text-line">
            &gt; El conocimiento primero
          </div>
          <div className="text-line">
            &gt; Sin spam
          </div>
          <div className="text-line">
            &gt; Oportunidades laborales
          </div>
        </div>

        {isMobile && (
          <div className="mobile-controls">
            <div className="controls-row">
              <button 
                className="nav-button esc-button"
                onClick={() => router.push('/')}
              >
                ESC
              </button>
              <button 
                className="nav-button enter-button"
                onClick={handleJoinTelegram}
              >
                ENTER → TELEGRAM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
