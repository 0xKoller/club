'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function Page() {
  const [scrollPosition, setScrollPosition] = useState(0);
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

  const content = [
    'APPLY.TXT',
    '------------',
    'Presione ESC para volver al menú principal',
    'Use las flechas arriba/abajo para navegar',
    '================',
    '',
    'REQUISITOS',
    '----------',
    '> BOLD and different',
    '> Tener presencia activa en X',
    '> Sentirse orgulloso de ser argentino',
    '> Compartir la visión del club',
    '> Ser emprendedor',
    '> Saber de lo que hablas',
    '',
    'PROCESO',
    '-------',
    '> Ser voucheado por un miembro fundador',
    '> Screening con otros fundadores en algun evento que la O(n) asista',
    '> Aporte de valor en X y a la O(n)',
    '> Notificacion de aceptacion por parte del miembro fundador inicial',
    '',
    'NOTA',
    '----',
    'Las solicitudes son evaluadas diariamente por los miembros fundadores.',
    'La decisión final es inapelable.',
    'El proceso de aplicación es abierto a todo el publico.',
    'El comité de fundadores se reserva el derecho de no aceptar una solicitud por cualquier motivo.',
    '',
    '> O(n) Club',
    '> 2024',
    ''
  ];

  const handleScroll = (direction) => {
    setScrollPosition(prev => {
      if (direction === 'up') {
        return Math.max(0, prev - 1);
      } else {
        return Math.min(content.length - 20, prev + 1);
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleScroll('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleScroll('down');
          break;
        case 'Escape':
          e.preventDefault();
          router.push('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="header-title">APPLY.TXT - O(n) Club</div>
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
        <pre className="manifesto-text">
          {content.slice(scrollPosition, scrollPosition + 20).map((line, i) => (
            <div key={i} className="text-line">
              {line}
            </div>
          ))}
        </pre>
        
        {isMobile && (
          <div className="mobile-controls">
            <button 
              className="nav-button"
              onClick={() => handleScroll('up')}
              disabled={scrollPosition === 0}
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
              onClick={() => handleScroll('down')}
              disabled={scrollPosition >= content.length - 20}
            >
              ▼
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
