'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    'Welcome to O(n) Club Terminal [Version 1.0]', 
    'Copyright (c) 2024 O(n) Club. All rights reserved.',
    '',
    'Available commands:',
    'manifesto - View O(n) Club manifesto',
    'members   - List club members',
    'founders  - View founding members',
    'apply     - Apply to O(n) Club',
    'clear    - Clear terminal',
    'exit     - Exit terminal',
    ''
  ]);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  const [systemInfo, setSystemInfo] = useState({
    leftColumn: {},
    rightColumn: {}
  });

  useEffect(() => {
    const checkMobile = () => {
      setShowKeyboard(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
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

  const handleExit = () => {
    setHistory(prev => [...prev, `C:\\ON_CLUB>exit`, 'Goodbye!']);
    // Try different methods to close the window
    setTimeout(() => {
      try {
        window.close();
        // If window.close() doesn't work, try alternative methods
        if (window.opener) {
          window.opener = null;
          window.open('', '_self');
        }
        window.location.href = 'about:blank';
      } catch (e) {
        console.log('Unable to close window automatically');
      }
    }, 1000);
  };

  const commands = {
    help: () => {
      setHistory(prev => [...prev, 
        'Available commands:',
        'manifesto - View O(n) Club manifesto',
        'members   - List club members',
        'founders  - View founding members',
        'apply     - Apply to O(n) Club',
        'clear    - Clear terminal',
        'exit     - Exit terminal',
        ''
      ]);
    },
    clear: () => setHistory(['Welcome to O(n) Club Terminal [Version 1.0]', '']),
    manifesto: () => router.push('/manifesto'),
    members: () => router.push('/members'),
    founders: () => router.push('/founders'),
    apply: () => router.push('/apply'),
    exit: handleExit
  };

  const handleCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    setHistory(prev => [...prev, `O(N) CLUB:\\>${cmd}`]);
    
    if (commands[trimmedCmd]) {
      if (trimmedCmd === 'clear') {
        commands[trimmedCmd]();
      } else if (trimmedCmd === 'exit') {
        commands[trimmedCmd]();
      } else {
        // Add loading messages
        setHistory(prev => [...prev, 
          'Loading...',
          `Reading ${trimmedCmd.toUpperCase()}.DAT`,
          'Please wait...',
          ''
        ]);
        
        // For navigation commands, add delay
        setTimeout(() => {
          commands[trimmedCmd]();
        }, 800);
      }
    } else {
      setHistory(prev => [...prev, `'${cmd}' is not recognized as an internal command`, '']);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleCommand(input);
    }
  };


  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="header-title">O(n) Club - Terminal</div>
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
        {history.map((line, i) => (
          <div key={i} className="command-line">
            {line.startsWith('C:\\') ? (
              <>{line}</>
            ) : (
              <span>{line}</span>
            )}
          </div>
        ))}
        
        <div className="command-input-line">
          <span className="prompt">O(N) CLUB:\&gt;</span>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="command-input"
              autoFocus
              autoCapitalize="none"
            />
            <span 
              className="cursor"
              style={{ 
                position: 'absolute',
                left: `${input.length * 9.6}px`,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
          </div>
        </div>

        {showKeyboard && (
          <div className="mobile-controls">
            <div className="controls-row">
              <button 
                className="nav-button"
                onClick={() => handleCommand('help')}
              >
                HELP
              </button>
              <button 
                className="nav-button esc-button"
                onClick={() => handleCommand('clear')}
              >
                CLEAR
              </button>
              <button 
                className="nav-button"
                onClick={() => handleCommand('exit')}
              >
                EXIT
              </button>
            </div>
            <div className="controls-row">
              <button 
                className="nav-button"
                onClick={() => handleCommand('manifesto')}
              >
                MANIFESTO
              </button>
              <button 
                className="nav-button"
                onClick={() => handleCommand('members')}
              >
                MEMBERS
              </button>
              <button 
                className="nav-button"
                onClick={() => handleCommand('founders')}
              >
                FOUNDERS
              </button>
            </div>
            <div className="controls-row">
              <button 
                className="nav-button"
                onClick={() => handleCommand('apply')}
              >
                APPLY
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
