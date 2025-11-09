import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const updateMouse = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', updateMouse);
    return () => window.removeEventListener('mousemove', updateMouse);
  }, []);

  return (
    <>
      <div className={`cover ${revealed ? 'revealed' : ''}`} />
      <div className="content">
        <h1>Into The Depth</h1>
        <button onClick={() => setRevealed(true)}>Find the light</button>
      </div>
    </>
  );
}
