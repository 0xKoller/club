'use client';
import { useEffect } from 'react';

export default function CustomPointer() {
  useEffect(() => {
    const pointer = document.createElement('div');
    pointer.className = 'custom-pointer';
    document.body.appendChild(pointer);

    const movePointer = (e) => {
      pointer.style.left = `${e.clientX}px`;
      pointer.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', movePointer);
    return () => {
      window.removeEventListener('mousemove', movePointer);
      pointer.remove();
    };
  }, []);

  return null;
} 