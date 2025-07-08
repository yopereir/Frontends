import React, { useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const Background = () => {
  const canvasRef = useRef(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = [];
    const numNodes = 50;
    const maxDistance = 150;

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    let animationFrameId;

    const drawNetwork = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const strokeStyle = theme === 'light' ? '#0005' : '#fff5';

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          let dx = nodes[i].x - nodes[j].x;
          let dy = nodes[i].y - nodes[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = strokeStyle;
        ctx.arc(nodes[i].x, nodes[i].y, 5, 0, Math.PI * 2);
        ctx.fill();

        nodes[i].x += nodes[i].vx;
        nodes[i].y += nodes[i].vy;

        if (nodes[i].x <= 0 || nodes[i].x >= canvas.width) nodes[i].vx *= -1;
        if (nodes[i].y <= 0 || nodes[i].y >= canvas.height) nodes[i].vy *= -1;
      }

      animationFrameId = requestAnimationFrame(drawNetwork);
    };

    drawNetwork();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const canvasStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    display: 'block',
    backgroundColor: theme === 'light' ? 'white' : 'black',
  };

  return <canvas ref={canvasRef} style={canvasStyle}></canvas>;
};

export default Background;
