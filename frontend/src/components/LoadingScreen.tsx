import { useEffect, useState, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import { animate, set } from 'animejs';
import { DURATIONS, EASINGS, shouldAnimate } from '../animations/constants';

interface LoadingScreenProps {
  isComplete?: boolean;
}

const LoadingScreen = ({ isComplete = false }: LoadingScreenProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const capRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any | null>(null);

  // Animate the baseball cap with playful bounce
  useEffect(() => {
    if (!capRef.current || !shouldAnimate() || isComplete) return;

    animationRef.current = animate(capRef.current, {
      translateY: [-20, 0, -20],
      rotate: [-5, 5, -5],
      duration: DURATIONS.verySlow,
      ease: EASINGS.easeInOutBack,
      loop: true,
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [isComplete]);

  // Animate the loading bar
  useEffect(() => {
    if (!loadingBarRef.current || !shouldAnimate() || isComplete) return;

    const barAnimation = animate(loadingBarRef.current, {
      width: ['0%', '100%'],
      duration: 2000,
      ease: EASINGS.easeOut,
      loop: true,
    });

    return () => {
      barAnimation.pause();
    };
  }, [isComplete]);

  // Success state with particle burst
  useEffect(() => {
    if (isComplete) {
      setShowSuccess(true);

      if (!shouldAnimate() || !particlesRef.current) return;

      // Stop the cap animation
      if (animationRef.current) {
        animationRef.current.pause();
      }

      // Create particles burst effect
      const particlesContainer = particlesRef.current;
      const particleCount = 8;
      const particles: HTMLDivElement[] = [];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = '#10b981';
        particle.style.top = '50%';
        particle.style.left = '50%';
        particlesContainer.appendChild(particle);
        particles.push(particle);
      }

      // Animate particles
      animate(particles, {
        translateX: () => Math.random() * 120 - 60,
        translateY: () => Math.random() * 120 - 60,
        scale: [0, 1.5, 0],
        opacity: [1, 0],
        duration: 800,
        ease: EASINGS.easeOut,
        delay: (el: any, i: number) => i * 80,
        onComplete: () => {
          particles.forEach(p => p.remove());
        },
      });
    }
  }, [isComplete]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center relative">
        {/* Baseball Cap Logo */}
        <div
          ref={capRef}
          className={`mb-8 ${showSuccess ? 'scale-110' : ''}`}
          style={{ willChange: shouldAnimate() ? 'transform' : 'auto' }}
        >
          <div className="text-9xl">🧢</div>
        </div>

        {/* Loading or Success State */}
        {!showSuccess ? (
          <>
            {/* Loading bar */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                ref={loadingBarRef}
                className="h-full bg-green-600 rounded-full"
                style={{ willChange: shouldAnimate() ? 'transform' : 'auto' }}
              />
            </div>
            <p className="mt-4 text-gray-600 text-sm">Loading your dashboard...</p>
          </>
        ) : (
          <>
            {/* Particles container */}
            <div
              ref={particlesRef}
              className="absolute inset-0 pointer-events-none"
              style={{ willChange: shouldAnimate() ? 'transform' : 'auto' }}
            />

            {/* Success checkmark */}
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <p className="font-medium">Welcome!</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
