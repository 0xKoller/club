'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import data from './founder.json';

function Page() {
  const [selectedFounder, setSelectedFounder] = useState(0);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const selectedRef = useRef(null);

  // Add system info state
  const [systemInfo, setSystemInfo] = useState({
    leftColumn: {},
    rightColumn: {}
  });

  // Add system info effect
  useEffect(() => {
    const updateSystemInfo = () => {
      const platform = navigator.platform;
      const userAgent = navigator.userAgent;
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
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedFounder]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelection = (direction) => {
    if (direction === 'up') {
      setSelectedFounder(prev => prev > 0 ? prev - 1 : data.length - 1);
    } else {
      setSelectedFounder(prev => prev < data.length - 1 ? prev + 1 : 0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleSelection('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleSelection('down');
          break;
        case 'Enter':
          e.preventDefault();
          window.open(`https://x.com/${data[selectedFounder].twitter}`, '_blank');
          break;
        case 'Escape':
          e.preventDefault();
          router.push('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFounder, router]);

  const handleTwitterOpen = () => {
    window.open(`https://x.com/${data[selectedFounder].twitter}`, '_blank');
  };

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="header-title">FOUNDERS.DAT - O(n) Club</div>
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
          Directory listing of FOUNDERS.DAT
        </div>
        <div className="command-line">
          Total founders: {data.length}
        </div>
        <div className="command-line">
          Press ENTER to view Twitter profile, ESC to return
        </div>
        
        <div className="content-wrapper">
          <div className="directory-listing directory-listing-founders">
            {data.map((founder, index) => {
              const [lastName, firstName] = founder.name.split(", ");
              const isSelected = index === selectedFounder;
              return (
                <div
                  key={founder.id}
                  ref={isSelected ? selectedRef : null}
                  className={`menu-option ${isSelected ? 'selected' : ''}`}
                >
                  {`${lastName.padEnd(15)} ${firstName.padEnd(15)} [@${founder.twitter}]`}
                </div>
              );
            })}
          </div>
          
          <div className="founder-details">
            <div className="command-line">
              FOUNDER.INF - {data[selectedFounder].name}
            </div>
            <div className="detail-section">
              <div className="scrollable-content">
                <div className="detail-line">Name: {data[selectedFounder].name}</div>
                <div className="detail-line">Twitter: @{data[selectedFounder].twitter}</div>
                <div className="detail-line">A.K.A: {data[selectedFounder].aka}</div>
                {data[selectedFounder].description && (
                  <>
                    <div className="detail-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div className="detail-line">Description:</div>
                    <div className="detail-line description">{data[selectedFounder].description}</div>
                  </>
                )}
                {data[selectedFounder].guiltyPleasure && (
                  <>
                    <div className="detail-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div className="detail-line">Guilty Pleasure:</div>
                    <div className="detail-line">{data[selectedFounder].guiltyPleasure}</div>
                  </>
                )}
                {data[selectedFounder].additionalDetail && (
                  <>
                    <div className="detail-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div className="detail-line">Additional Detail:</div>
                    <div className="detail-line">{data[selectedFounder].additionalDetail}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {isMobile && (
          <div className="mobile-controls">
            <div className="command-line" style={{ textAlign: 'center', marginBottom: '8px' }}>
              {`Viewing ${selectedFounder + 1} of ${data.length}`}
            </div>
            <div className="controls-row">
              <button 
                className="nav-button"
                onClick={() => handleSelection('up')}
                disabled={selectedFounder === 0}
              >
                ▲ PREV
              </button>
              <button 
                className="nav-button esc-button"
                onClick={() => router.push('/')}
              >
                ESC
              </button>
              <button 
                className="nav-button"
                onClick={() => handleSelection('down')}
                disabled={selectedFounder >= data.length - 1}
              >
                NEXT ▼
              </button>
            </div>
            <div className="controls-row">
              <button 
                className="nav-button enter-button"
                onClick={handleTwitterOpen}
              >
                ENTER → TWITTER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
