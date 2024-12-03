'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import data from './founder.json';

function Page() {
  const [selectedFounder, setSelectedFounder] = useState(0);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

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
      <div className="terminal-header">FOUNDERS.DAT - O(n) Club</div>
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
        <div className="directory-listing">
          {data.map((founder, index) => {
            const [lastName, firstName] = founder.name.split(", ");
            const isSelected = index === selectedFounder;
            return (
              <div
                key={founder.id}
                className={`menu-option ${isSelected ? 'selected' : ''}`}
              >
                {`${lastName.padEnd(15)} ${firstName.padEnd(15)} [@${founder.twitter}]`}
              </div>
            );
          })}
        </div>
        
        {/* Show selected founder details */}
        <div className="founder-details">
          <div className="command-line">
            FOUNDER.INF - {data[selectedFounder].name}
          </div>
          <div className="detail-section">
            <div className="detail-line">ID: {data[selectedFounder].id}</div>
            <div className="detail-line">Name: {data[selectedFounder].name}</div>
            <div className="detail-line">Twitter: @{data[selectedFounder].twitter}</div>
            <div className="detail-line">A.K.A: {data[selectedFounder].aka}</div>
            {data[selectedFounder].description && (
              <>
                <div className="detail-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div className="detail-line">Description:</div>
                <div className="detail-line">{data[selectedFounder].description}</div>
              </>
            )}
            {data[selectedFounder].guiltyPleasure && (
              <>
                <div className="detail-line">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <div className="detail-line">Guilty Pleasure:</div>
                <div className="detail-line">{data[selectedFounder].guiltyPleasure}</div>
              </>
            )}
          </div>
        </div>

        {isMobile && (
          <div className="mobile-controls">
            <div className="controls-row">
              <button 
                className="nav-button"
                onClick={() => handleSelection('up')}
                disabled={selectedFounder === 0}
              >
                ▲
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
                ▼
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
