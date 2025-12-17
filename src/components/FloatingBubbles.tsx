import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  opacity: number;
}

export const FloatingBubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles: Bubble[] = [];
      for (let i = 0; i < 12; i++) {
        newBubbles.push({
          id: i,
          size: Math.random() * 200 + 80,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 10,
          duration: Math.random() * 15 + 20,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
      setBubbles(newBubbles);
    };

    generateBubbles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            background: `radial-gradient(circle at 30% 30%, 
              hsl(240 45% 85% / ${bubble.opacity + 0.1}), 
              hsl(250 30% 90% / ${bubble.opacity * 0.5}), 
              transparent)`,
            animation: `bubbleFloat ${bubble.duration}s ease-in-out infinite`,
            animationDelay: `-${bubble.delay}s`,
            filter: "blur(1px)",
          }}
        />
      ))}
      {/* Larger accent bubbles */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          left: "10%",
          top: "20%",
          background: "radial-gradient(circle at center, hsl(210 35% 85% / 0.4), transparent 70%)",
          animation: "bubbleFloat 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full opacity-15"
        style={{
          right: "5%",
          bottom: "10%",
          background: "radial-gradient(circle at center, hsl(350 30% 90% / 0.3), transparent 70%)",
          animation: "bubbleFloat 30s ease-in-out infinite",
          animationDelay: "-8s",
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full opacity-20"
        style={{
          left: "60%",
          top: "5%",
          background: "radial-gradient(circle at center, hsl(150 25% 85% / 0.3), transparent 70%)",
          animation: "bubbleFloat 22s ease-in-out infinite",
          animationDelay: "-15s",
        }}
      />
    </div>
  );
};
