import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import "./IntroPage.css";
import Banana from "../components/Banana";

export default function IntroPage({ onReveal }) {
  const [fading, setFading] = useState(false);
  const headerRef = useRef(null);
  const particlesRef = useRef(null);
  const letterRefs = useRef([]); // array of span refs
  const [particlesSize, setParticlesSize] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  // initialize tsparticles engine
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // particle options (triangles + links + repulse on hover)
  const particlesOptions = {
    fullScreen: false,
    detectRetina: true,
    fpsLimit: 60,
    particles: {
      number: { value: 38, density: { enable: true, area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "triangle" },
      opacity: { value: 0.9, random: { enable: true, minimumValue: 0.3 } },
      size: { value: { min: 2.0, max: 5.5 } },
      links: {
        enable: true,
        distance: 110,
        color: "#bfe8cf",
        opacity: 0.18,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.6,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
    },
    interactivity: {
      detectsOn: "canvas",
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: false },
        resize: true,
      },
      modes: {
        repulse: { distance: 120, duration: 0.4 },
      },
    },
    retina_detect: true,
  };

  // set up element refs size for particle overlay and letter refs
  useEffect(() => {
    const updateSize = () => {
      const el = headerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setParticlesSize({
        width: r.width,
        height: r.height,
        left: r.left + window.scrollX,
        top: r.top + window.scrollY,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    window.addEventListener("scroll", updateSize, { passive: true });
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("scroll", updateSize);
    };
  }, []);

  // Split text into letters and set refs size on mount
  const heading = "INTO THE DEPTH";
  // initialize letterRefs length
  letterRefs.current = Array.from({ length: heading.length }).map(
    (_, i) => letterRefs.current[i] || null
  );

  // pointer move handler: update CSS mouse vars AND compute per-letter opacity
  useEffect(() => {
    const pointerMove = (e) => {
      // update base CSS var for radial mask if desired elsewhere
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);

      // compute per-letter opacity based on distance
      const RADIUS = 120; // pixels within which letter fades (tweakable)
      for (let i = 0; i < letterRefs.current.length; i++) {
        const ref = letterRefs.current[i];
        if (!ref) continue;
        const rect = ref.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // opacity mapping: dist=0 -> 0, dist>=RADIUS -> 1, smooth step in between
        let t = dist / RADIUS;
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        const opacity = t; // linear
        ref.style.opacity = String(opacity);
        // optionally add slight blur effect proportional to (1 - opacity)
        ref.style.filter = `blur(${(1 - opacity) * 1.6}px)`;
        // slight scale when near pointer (optional)
        ref.style.transform = `translateZ(0) scale(${
          1 - (1 - opacity) * 0.02
        })`;
      }
    };

    // use pointermove so touch + mouse both work
    window.addEventListener("pointermove", pointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", pointerMove);
  }, []);

  // reveal on scroll/gesture (keeps your previous reveal flow)
  useEffect(() => {
    const triggerReveal = (e) => {
      setFading(true);
      removeListeners();
    };
    const removeListeners = () => {
      window.removeEventListener("wheel", triggerReveal);
      window.removeEventListener("touchstart", triggerReveal);
      window.removeEventListener("keydown", triggerReveal);
      window.removeEventListener("pointerdown", triggerReveal);
    };
    window.addEventListener("wheel", triggerReveal, { passive: true });
    window.addEventListener("touchstart", triggerReveal, { passive: true });
    window.addEventListener("keydown", triggerReveal);
    window.addEventListener("pointerdown", triggerReveal, { passive: true });
    return () => removeListeners();
  }, []);

  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => {
      if (onReveal) onReveal();
    }, 700);
    return () => clearTimeout(t);
  }, [fading, onReveal]);

  // render
  return (
    <div className={`intro-wrapper ${fading ? "intro-fade" : ""}`}>
      {/* Particles overlay placed exactly over the heading */}
      <div
        className="header-particles-container"
        style={{
          left: particlesSize.left,
          top: particlesSize.top,
          width: particlesSize.width,
          height: particlesSize.height,
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <Particles
          id="heading-particles"
          init={particlesInit}
          options={particlesOptions}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <Canvas
        style={{ position: "absolute", inset: 0, zIndex: 0 }} // <<< add this
        shadows={false}
        camera={{ position: [0, 0.6, 2.5], fov: 48 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000");
        }}
      >
        >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.6} />
        <pointLight intensity={0.35} position={[2, 2, 2]} />
        <Environment preset="night" />
        <Banana position={[0, 0.15, 0]} scale={0.02} />
      </Canvas>

      {/* Heading: split into letters (preserve spaces) */}
      <div className="intro-header" ref={headerRef}>
        {heading.split("").map((ch, i) => {
          // spaces get a non-breaking space and a simple wrapper
          if (ch === " ") {
            return (
              <span
                key={`sp-${i}`}
                className="intro-letter intro-space"
                ref={(el) => (letterRefs.current[i] = el)}
                aria-hidden
              >
                &nbsp;
              </span>
            );
          }
          return (
            <span
              key={i}
              className="intro-letter"
              ref={(el) => (letterRefs.current[i] = el)}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <div className="intro-sub">Scroll / swipe / press any arrow →</div>
    </div>
  );
}
