import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Terminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(['Welcome to O(n) Club Terminal']);
  const [selectedOption, setSelectedOption] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  const options = [
    { label: 'Manifesto', command: 'manifesto', path: '/manifesto' },
    { label: 'Members', command: 'members', path: '/members' },
    { label: 'Founders', command: 'founders', path: '/founders' },
    { label: 'Exit', command: 'exit', action: () => window.close() }
  ];

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption]);

  const handleKeyDown = (e) => {
    switch(e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedOption(prev => prev > 0 ? prev - 1 : options.length - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedOption(prev => prev < options.length - 1 ? prev + 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        const selected = options[selectedOption];
        if (selected.path) {
          router.push(selected.path);
        } else if (selected.action) {
          selected.action();
        }
        break;
    }
  };

  return (
    <div className="terminal">
      <div className="terminal-content">
        {history.map((line, i) => (
          <div key={i} className="command-line">
            <span className="prompt">O(N) CLUB:\&gt;</span>
            <span>{line}</span>
          </div>
        ))}
        <div className="menu">
          {options.map((option, index) => (
            <div
              key={option.command}
              className={`menu-option ${index === selectedOption ? 'selected' : ''}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}