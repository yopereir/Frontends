import React, { useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext'; // Ensure this path is correct

const Background = () => {
  const canvasRef = useRef(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Guard clause in case canvas ref is not yet available
    const ctx = canvas.getContext('2d');

    // --- Configuration (moved inside useEffect to react to theme changes if needed) ---
    const STAR_COUNT = 150;
    const STAR_RADIUS_MAX = 2;
    const STAR_FADE_SPEED = 0.01;
    const STAR_LIFETIME_MAX = 200;
    const CROSS_THICKNESS = 10;
    const CROSS_LENGTH_H_RATIO = 0.3;
    const CROSS_LENGTH_V_RATIO = 0.7;
    const CROSS_INTERSECTION_HEIGHT = 0.2;

    let stars = [];
    let canvasWidth, canvasHeight;
    let bgColor, elementColor;
    let animationFrameId; // To store the animation frame ID for cleanup

    // --- Helper Functions (nested to use closure for ctx, canvasWidth, etc.) ---

    // Convert hex color string (#RRGGBB) to RGB components string ("R, G, B")
    const hexToRgb = (hex) => {
      if (!hex) return '0,0,0';
      hex = hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    };

    // Adjust canvas size to fill window and update dimensions
    const resizeCanvas = () => {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      // Stars are re-initialized on component mount, not on every resize
      // If you want star density to be maintained on resize,
      // you would need to re-initializeStars() here or adjust existing stars.
      // For now, let's keep them fixed count, so density changes with resize.
    };

    // Set background and element colors based on theme context
    const setColorScheme = () => {
      if (theme === 'light') {
        bgColor = '#ffffff7f'; // White background
        elementColor = '#0000007f'; // Black elements (stars, cross)
      } else {
        bgColor = '#0000007f'; // Black background
        elementColor = '#ffffff7f'; // White elements
      }
    };

    // Create the initial population of stars
    const initializeStars = () => {
      if (!canvasWidth || !canvasHeight) {
        resizeCanvas(); // Ensure dimensions are set before creating stars
      }
      stars = []; // Clear any existing stars
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
      }
    };

    // Draw the centered cross on the canvas
    const drawCross = () => {
      if (!elementColor || !canvasWidth || !canvasHeight) return;
      const crossWidth = canvasWidth * CROSS_LENGTH_H_RATIO * ((window.innerWidth > 750)? 1:2);
      const crossHeight = canvasHeight * CROSS_LENGTH_V_RATIO;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight*1.5 / 2;

      ctx.fillStyle = elementColor;
      // Draw horizontal bar
      ctx.fillRect(
        centerX - crossWidth / 2,
        centerY - CROSS_THICKNESS / 2 - centerY * CROSS_INTERSECTION_HEIGHT,
        crossWidth,
        CROSS_THICKNESS
      );
      // Draw vertical bar
      ctx.fillRect(
        centerX - CROSS_THICKNESS / 2,
        centerY - crossHeight / 2,
        CROSS_THICKNESS,
        crossHeight
      );
    };

    // --- Star Class (nested to use closure for ctx, canvasWidth, etc.) ---
    class Star {
      constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.opacity = 0;
        this.maxOpacity = 0;
        this.life = 0;
        this.fadingIn = true;
        this.reset();
        this.opacity = 0; // Start invisible
        this.life = Math.random() * STAR_LIFETIME_MAX; // Start at random point in life
      }

      reset() {
        const effectiveWidth = canvasWidth || window.innerWidth;
        const effectiveHeight = canvasHeight || window.innerHeight;
        this.x = Math.random() * effectiveWidth;
        this.y = Math.random() * effectiveHeight;
        this.radius = Math.random() * STAR_RADIUS_MAX + 0.5;
        this.maxOpacity = Math.random() * 0.7 + 0.3;
        this.life = STAR_LIFETIME_MAX;
        this.opacity = 0;
        this.fadingIn = true;
      }

      update() {
        this.life--;
        if (this.life <= 0) {
          this.reset();
          return;
        }

        if (this.fadingIn) {
          this.opacity += STAR_FADE_SPEED;
          if (this.opacity >= this.maxOpacity) {
            this.opacity = this.maxOpacity;
            this.fadingIn = false;
          }
        } else {
          const fadeOutSpeed = (1 - (this.life / STAR_LIFETIME_MAX)) * STAR_FADE_SPEED * 5 + STAR_FADE_SPEED;
          this.opacity -= fadeOutSpeed;
          if (this.opacity < 0) {
            this.opacity = 0;
          }
        }
        this.opacity = Math.max(0, Math.min(this.maxOpacity, this.opacity));
      }

      draw() {
        if (this.opacity <= 0 || !elementColor) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(elementColor)}, ${this.opacity})`;
        ctx.fill();
      }
    }

    // --- Animation Loop ---
    const animate = () => {
      setColorScheme(); // Update colors based on current theme

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      drawCross();

      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // --- Initialization ---
    resizeCanvas(); // Set initial canvas size
    setColorScheme(); // Set initial color scheme based on theme context
    initializeStars(); // Create the stars
    animate(); // Start the animation loop

    // Add event listener for window resize
    window.addEventListener('resize', resizeCanvas);

    // --- Cleanup Function ---
    // This runs when the component unmounts or when dependencies change
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId); // Stop the animation loop
    };
  }, [theme]); // Rerun effect if the theme changes

  const canvasStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    display: 'block',
    // Background color is handled by canvas drawing, but keeping this for immediate visual
    // and as a fallback if JS doesn't run for some reason.
    // However, the JS `ctx.fillRect` is the primary background setter.
    backgroundColor: theme === 'light' ? 'white' : 'black',
  };

  return <canvas ref={canvasRef} style={canvasStyle}></canvas>;
};

export default Background;