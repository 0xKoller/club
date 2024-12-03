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
    'clear    - Clear terminal',
    'exit     - Exit terminal',
    ''
  ]);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setShowKeyboard(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
        'clear    - Clear terminal',
        'exit     - Exit terminal',
        ''
      ]);
    },
    clear: () => setHistory(['Welcome to O(n) Club Terminal [Version 1.0]', '']),
    manifesto: () => router.push('/manifesto'),
    members: () => router.push('/members'),
    founders: () => router.push('/founders'),
    exit: handleExit
  };

  const handleCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    setHistory(prev => [...prev, `O(N) CLUB:\\>${cmd}`]);
    
    if (commands[trimmedCmd]) {
      commands[trimmedCmd]();
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

  const handleVirtualKey = (key) => {
    if (key === 'ENTER') {
      if (input.trim()) handleCommand(input);
    } else if (key === 'BACKSPACE') {
      setInput(prev => prev.slice(0, -1));
    } else if (key === 'SPACE') {
      setInput(prev => prev + ' ');
    } else {
      setInput(prev => prev + key.toLowerCase());
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const keyboardLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <div className="terminal">
      <div className="terminal-header">O(n) Club - MS-DOS</div>
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
          <span className="cursor"></span>
        </div>

        {showKeyboard && (
          <div className="virtual-keyboard">
            {keyboardLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="keyboard-row">
                {rowIndex === 3 && (
                  <button
                    className="keyboard-key shift-key"
                    onClick={() => handleVirtualKey('SHIFT')}
                  >
                    SHIFT
                  </button>
                )}
                {row.map(key => (
                  <button
                    key={key}
                    className="keyboard-key"
                    onClick={() => handleVirtualKey(key)}
                  >
                    {key}
                  </button>
                ))}
                {rowIndex === 3 && (
                  <button
                    className="keyboard-key backspace-key"
                    onClick={() => handleVirtualKey('BACKSPACE')}
                  >
                    ←
                  </button>
                )}
              </div>
            ))}
            <div className="keyboard-row">
              <button
                className="keyboard-key space-key"
                onClick={() => handleVirtualKey('SPACE')}
              >
                SPACE
              </button>
              <button
                className="keyboard-key enter-key"
                onClick={() => handleVirtualKey('ENTER')}
              >
                ENTER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
