import React, { useEffect, useRef } from 'react';

export const OceanCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Ships moving across the oceanic route
    const ships = [
      {
        x: width * 0.15,
        y: height * 0.48,
        speed: 0.22,
        length: 85,
        width: 16,
        type: 'Tanker (MT Al-Hikma)',
        wakeLength: 120,
        trail: [] as Array<{ x: number; y: number; alpha: number }>,
      },
      {
        x: width * 0.72,
        y: height * 0.38,
        speed: -0.32,
        length: 70,
        width: 14,
        type: 'Container (Pacific Glory)',
        wakeLength: 90,
        trail: [] as Array<{ x: number; y: number; alpha: number }>,
      },
      {
        x: width * 0.45,
        y: height * 0.62,
        speed: 0.18,
        length: 45,
        width: 10,
        type: 'General Cargo',
        wakeLength: 60,
        trail: [] as Array<{ x: number; y: number; alpha: number }>,
      },
    ];

    // Atmospheric drift particles
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0.4 + Math.random() * 0.5,
        vy: -0.15 + Math.random() * 0.1,
        size: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.35,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;

      // 1. Water Gradient Background (Deep oceanic teal to serene grey-blue)
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
      oceanGrad.addColorStop(0, '#0c1b29');
      oceanGrad.addColorStop(0.35, '#0e2438');
      oceanGrad.addColorStop(0.7, '#13334c');
      oceanGrad.addColorStop(1, '#184261');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Bathymetric Depth Contours (Grid & Topography)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 70;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Realistic Gentle Ocean Waves (Layered Sine wave displacement)
      for (let layer = 0; layer < 4; layer++) {
        ctx.save();
        const layerAlpha = 0.04 + layer * 0.025;
        ctx.fillStyle = `rgba(147, 197, 253, ${layerAlpha})`;
        ctx.beginPath();
        ctx.moveTo(0, height);

        const yBase = height * (0.35 + layer * 0.16);
        const waveFreq = 0.003 + layer * 0.0015;
        const waveSpeed = time * (1.2 + layer * 0.6);
        const waveAmp = 10 + layer * 5;

        for (let x = 0; x <= width; x += 15) {
          const y = yBase + Math.sin(x * waveFreq + waveSpeed) * waveAmp + Math.cos(x * 0.008 - waveSpeed * 0.5) * (waveAmp * 0.35);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 4. Subtle Sentinel-1 SAR Orbital Swath Projection & Satellite Track
      const swathX = ((time * 30) % (width + 600)) - 300;
      const swathWidth = 260;

      ctx.save();
      const swathGrad = ctx.createLinearGradient(swathX - swathWidth / 2, 0, swathX + swathWidth / 2, 0);
      swathGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      swathGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.09)');
      swathGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = swathGrad;
      ctx.fillRect(swathX - swathWidth / 2, 0, swathWidth, height);

      // Radar sweep scanline
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(swathX, 0);
      ctx.lineTo(swathX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Satellite icon at top of swath
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(swathX, 28, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.fillText('SENTINEL-1C C-SAR PASS 114 [14:32 UTC]', swathX + 10, 32);
      ctx.restore();

      // 5. Simulated SAR Detected Oil Slick with Iridescent Damping Footprint
      const slickCenterX = width * 0.48;
      const slickCenterY = height * 0.54;

      ctx.save();
      // Outer uncertainty dispersion aura
      const slickGlow = ctx.createRadialGradient(slickCenterX, slickCenterY, 10, slickCenterX, slickCenterY, 140);
      slickGlow.addColorStop(0, 'rgba(217, 119, 6, 0.45)');
      slickGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.22)');
      slickGlow.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = slickGlow;
      ctx.beginPath();
      ctx.ellipse(slickCenterX, slickCenterY, 130, 48, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Core slick contour
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Organic polygon shape for the oil slick
      const slickPoints = [
        [-90, -15], [-50, -32], [20, -22], [85, 5], [110, 25],
        [70, 38], [10, 32], [-65, 20], [-90, -15]
      ];
      slickPoints.forEach(([px, py], idx) => {
        const sx = slickCenterX + px + Math.sin(time * 2 + idx) * 3;
        const sy = slickCenterY + py + Math.cos(time * 2 + idx) * 2;
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
      ctx.stroke();

      // Technical SAR annotation label
      ctx.fillStyle = '#fef3c7';
      ctx.font = '11px "IBM Plex Mono", monospace';
      ctx.fillText('TARGET SLICK: 14.85 km² [DAMPING 6.2 dB]', slickCenterX - 110, slickCenterY - 45);

      // Backward Drift Hindcast Vector from Slick to Reconstructed Origin
      const originX = width * 0.28;
      const originY = height * 0.49;

      ctx.strokeStyle = '#38bdf8';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(slickCenterX - 20, slickCenterY);
      ctx.quadraticCurveTo(width * 0.38, height * 0.56, originX, originY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Probabilistic Origin Contours (50%, 80%, 95%)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(originX, originY, 32, 18, -Math.PI / 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.ellipse(originX, originY, 52, 28, -Math.PI / 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(originX, originY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.fillText('EST. ORIGIN P50 (09:22 UTC)', originX - 70, originY - 26);
      ctx.restore();

      // 6. Draw Sailing Commercial Vessels & Wakes
      ships.forEach((ship) => {
        ship.x += ship.speed;
        if (ship.speed > 0 && ship.x > width + 100) ship.x = -100;
        if (ship.speed < 0 && ship.x < -100) ship.x = width + 100;

        ctx.save();
        ctx.translate(ship.x, ship.y);

        // Vessel wake
        const wakeDir = ship.speed > 0 ? -1 : 1;
        const wakeGrad = ctx.createLinearGradient(0, 0, wakeDir * ship.wakeLength, 0);
        wakeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        wakeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = wakeGrad;
        ctx.beginPath();
        ctx.moveTo(0, -ship.width / 2);
        ctx.lineTo(wakeDir * ship.wakeLength, -ship.width * 1.6);
        ctx.lineTo(wakeDir * ship.wakeLength, ship.width * 1.6);
        ctx.lineTo(0, ship.width / 2);
        ctx.closePath();
        ctx.fill();

        // Ship hull silhouette
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const dir = ship.speed > 0 ? 1 : -1;
        ctx.moveTo(dir * (ship.length / 2), 0); // bow
        ctx.lineTo(dir * (ship.length * 0.25), -ship.width / 2);
        ctx.lineTo(-dir * (ship.length / 2), -ship.width / 2); // stern port
        ctx.lineTo(-dir * (ship.length / 2), ship.width / 2); // stern stbd
        ctx.lineTo(dir * (ship.length * 0.25), ship.width / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Deck structures & Navigation light
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(-dir * (ship.length * 0.2), -ship.width * 0.3, ship.length * 0.25, ship.width * 0.6);

        // Nav mast green/red lights
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(dir * (ship.length * 0.2), ship.width / 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // AIS telemetry tag
        ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillText(`${ship.type}`, -30, -ship.width - 6);

        ctx.restore();
      });

      // 7. Atmospheric Wind Vectors / Drift particles
      ctx.save();
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;

        ctx.fillStyle = `rgba(203, 213, 225, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
      {/* Editorial GIS Coordinate Crosshair Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '4px',
          color: '#e2e8f0',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <span>LAT: 18°25′12″ N</span>
        <span>•</span>
        <span>LON: 71°10′48″ E</span>
        <span>•</span>
        <span style={{ color: '#38bdf8' }}>ARABIAN SEA CORRIDOR</span>
      </div>
    </div>
  );
};
