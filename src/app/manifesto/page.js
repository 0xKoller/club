'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function Page() {
  const [scrollPosition, setScrollPosition] = useState(0);
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

  const content = [
    'MANIFIESTO.TXT',
    '================',
    '',
    'INTRODUCCION',
    '------------',
    'En un contexto global marcado por el rápido avance de las tecnologías de',
    'la información, se hace imperativo el establecimiento de plataformas que',
    'faciliten la colaboración y el intercambio intelectual entre',
    'profesionales y emprendedores del sector. El O(n) Club se constituye con',
    'el propósito de reunir a individuos interesados en la exploración y el',
    'debate sobre el ecosistema tecnológico contemporáneo.',
    '',
    'MISION',
    '------',
    'La misión del O(n) Club es crear un entorno propicio para la interacción',
    'y el crecimiento intelectual de sus miembros, facilitando el intercambio',
    'de conocimientos y experiencias.',
    '',
    'VISION',
    '------',
    'El O(n) Club aspira a consolidarse como una comunidad de referencia en',
    'el ámbito de la tecnología, donde la convergencia de ideas innovadoras',
    'permita la materialización de proyectos vanguardistas y exitosos.',
    '',
    'OBJETIVOS',
    '---------',
    '> Fomentar el Networking',
    '> Promover el Conocimiento',
    '> Impulsar Proyectos',
    '> Incentivar la Innovación',
    '',
    'PRINCIPIOS',
    '----------',
    '> Colaboración',
    '> Inclusión',
    '> Transparencia',
    '> Compromiso',
    '> Confidencialidad',
    '> Ambición y Propósito',
    '> Reuniones Anuales',
    '> Admisión Abierta',
    '> Autoridad de los Miembros Fundadores',
    '',
    'Presione ESC para volver al menú principal',
    'Use las flechas arriba/abajo para navegar'
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
      <div className="terminal-header">MANIFIESTO.TXT - O(n) Club</div>
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
