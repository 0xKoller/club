'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import data from './member.json';

function Page() {
  const [selectedMember, setSelectedMember] = useState(0);
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
      setSelectedMember(prev => prev > 0 ? prev - 1 : data.length - 1);
    } else {
      setSelectedMember(prev => prev < data.length - 1 ? prev + 1 : 0);
    }
  };

  const handleTwitterOpen = () => {
    window.open(`https://x.com/${data[selectedMember].twitter}`, '_blank');
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
          handleTwitterOpen();
          break;
        case 'Escape':
          e.preventDefault();
          router.push('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMember, router]);

  return (
    <div className="terminal">
      <div className="terminal-header">MEMBERS.DAT - O(n) Club</div>
      <div className="terminal-content">
        <div className="command-line">
          Directory listing of MEMBERS.DAT
        </div>
        <div className="command-line">
          Total members: {data.length}/20
        </div>
        <div className="command-line">
          Press ENTER to view Twitter profile, ESC to return
        </div>
        <div className="directory-listing">
          {data.map((member, index) => {
            const [lastName, firstName] = member.name.split(", ");
            return (
              <div
                key={member.id}
                className={`menu-option ${index === selectedMember ? 'selected' : ''}`}
              >
                {`${lastName.padEnd(15)} ${firstName.padEnd(15)} [@${member.twitter}]`}
              </div>
            );
          })}
        </div>

        {isMobile && (
          <div className="mobile-controls">
            <div className="controls-row">
              <button 
                className="nav-button"
                onClick={() => handleSelection('up')}
                disabled={selectedMember === 0}
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
                disabled={selectedMember >= data.length - 1}
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
