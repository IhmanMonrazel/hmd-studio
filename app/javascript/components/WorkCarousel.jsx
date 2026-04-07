import { useState, useEffect, useRef } from "react";

const PROJECTS = [
  {
    num: "01",
    title: "BOOKING CLUB",
    description: "Booking infrastructure designed around the rhythm of sports clubs — clean, fast, frictionless.",
    stack: "Rails / PostgreSQL / Stripe / Heroku",
    link: "/work/booking-club",
    image: "https://res.cloudinary.com/dtlybacjm/image/upload/v1775130737/Image_02-04-2026_a%CC%80_13.49_grer8m.png",
  },
  {
    num: "02",
    title: "SAFEMOOV",
    description: "A civic tool for reporting safety incidents in real time — built for speed, clarity, and trust.",
    stack: "Rails / JS / Cloudinary",
    link: "/work/safemoov",
    image: "https://res.cloudinary.com/dtlybacjm/image/upload/v1775130738/Image_02-04-2026_a%CC%80_13.50_wf7kpl.png",
  },
  {
    num: "03",
    title: "PERSONAL PORTFOLIO",
    description: "A developer's identity, built to make an impression — multilingual, automated, and fully custom.",
    stack: "Rails / Google API / PostgreSQL",
    link: "/work/personal-portfolio",
    image: "https://res.cloudinary.com/dtlybacjm/image/upload/v1775130738/Image_02-04-2026_a%CC%80_13.51_jj39xo.png",
  },
];

export const WorkCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── MOBILE LAYOUT — onScroll depth carousel ──────────────
  // scrollRef attaches to the overflow:scroll container — onScroll
  // fires on the element itself, not window, so it works on mobile.
  // sticky inner + absolute panels = same depth effect as S3.
  if (isMobile) {
    const totalPanels = PROJECTS.length;

    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };

    return (
      <div style={{ width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            width: '100%',
            height: '100vh',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
            position: 'relative',
          }}
        >
          {/* Scroll track — gives the snap container its scrollable height */}
          <div style={{ height: `${totalPanels * 100}vh`, position: 'relative' }}>

            {/* Sticky viewport */}
            <div style={{
              position: 'sticky',
              top: 0,
              height: '100vh',
              overflow: 'hidden',
              clipPath: 'inset(0)',
            }}>
              {PROJECTS.map((project, i) => {
                const floatIndex = scrollProgress * totalPanels;
                const distance = floatIndex - i - 0.5;
                const absDistance = Math.abs(distance);

                const opacity = absDistance > 1.0 ? 0 : Math.max(0, Math.min(1, 1 - absDistance * 1.2));
                const scale = Math.max(0.92, Math.min(1, 1 - absDistance * 0.06));
                const y = absDistance > 1.4 ? (distance < 0 ? -120 : 120) : distance * 120;

                return (
                  <div key={project.num} style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 2rem',
                    opacity,
                    transform: `translateY(${y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                    pointerEvents: absDistance < 0.3 ? 'auto' : 'none',
                    overflow: 'hidden',
                    transition: 'transform 0.05s linear, opacity 0.05s linear',
                  }}>
                    {/* Background image */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${project.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      opacity: 0.15,
                      zIndex: 0,
                    }} />

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ width: '100%', height: '1.5px', background: '#CC0000', marginBottom: '1.5rem' }} />

                      <span style={{
                        fontFamily: 'Bebas Neue, sans-serif',
                        fontSize: '0.85rem',
                        color: '#CC0000',
                        letterSpacing: '0.2em',
                        display: 'block',
                        marginBottom: '0.4rem',
                      }}>{project.num}</span>

                      <h2 style={{
                        fontFamily: 'Bebas Neue, sans-serif',
                        fontSize: 'clamp(2.8rem, 12vw, 5rem)',
                        color: '#FFFFFF',
                        letterSpacing: '0.02em',
                        lineHeight: 1,
                        margin: '0 0 1rem 0',
                      }}>{project.title}</h2>

                      <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.9rem',
                        fontWeight: 300,
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.7,
                        margin: '0 0 1.5rem 0',
                      }}>{project.description}</p>

                      <a href={project.link} style={{
                        fontFamily: 'Bebas Neue, sans-serif',
                        fontSize: '1rem',
                        color: '#CC0000',
                        letterSpacing: '0.15em',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>VIEW PROJECT →</a>

                      <div style={{ width: '100%', height: '1.5px', background: '#CC0000', marginTop: '1.5rem' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ────────────────────────────────────────
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "55fr 45fr",
      minHeight: "calc(100dvh - 72px)",
      background: "#000000",
      color: "#ffffff",
    }}>
      {/* LEFT — project list */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 clamp(2rem, 5vw, 6rem)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}>
        <p style={{
          fontSize: "0.7rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          marginBottom: "clamp(2rem, 4vh, 3rem)",
          fontFamily: "Inter, sans-serif",
        }}>
          Selected Projects — 2024/2025
        </p>

        {PROJECTS.map((project, i) => (
          <a
            key={i}
            href={project.link}
            data-turbo="true"
            onMouseEnter={() => { setActiveIndex(i); setHovered(true); }}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              padding: "clamp(1.2rem, 2.5vh, 2rem) 0",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              borderBottom: i === PROJECTS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              textDecoration: "none",
              color: activeIndex === i ? "#ffffff" : "rgba(255,255,255,0.4)",
              transition: "color 0.3s ease",
              cursor: "pointer",
            }}
          >
            {/* Number */}
            <span style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              color: "#CC0000",
              fontFamily: "Inter, sans-serif",
              minWidth: "2rem",
            }}>
              {project.num}
            </span>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                letterSpacing: "0.04em",
                margin: 0,
                lineHeight: 1,
                transform: activeIndex === i ? "translateX(8px)" : "translateX(0)",
                transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                color: "inherit",
              }}>
                {project.title}
              </h2>
              <p style={{
                fontSize: "clamp(0.75rem, 1.1vw, 0.9rem)",
                color: "rgba(255,255,255,0.35)",
                margin: "0.4rem 0 0",
                fontFamily: "Inter, sans-serif",
                fontWeight: 300,
                opacity: activeIndex === i ? 1 : 0,
                transform: activeIndex === i ? "translateY(0)" : "translateY(4px)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}>
                {project.description}
              </p>
            </div>

            {/* Arrow */}
            <span style={{
              fontSize: "1.2rem",
              opacity: activeIndex === i ? 1 : 0,
              transform: activeIndex === i ? "translateX(0)" : "translateX(-8px)",
              transition: "all 0.3s ease",
              color: "#ffffff",
            }}>→</span>
          </a>
        ))}
      </div>

      {/* RIGHT — image preview */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "100dvh",
        overflow: "hidden",
        background: "#111111",
      }}>
        {PROJECTS.map((project, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              background: "#111111",
              opacity: activeIndex === i ? 1 : 0,
              transition: "opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <img
              src={project.image}
              alt={project.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: activeIndex === i ? "scale(1)" : "scale(1.04)",
                transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            />
            {/* Project number overlay */}
            <div style={{
              position: "absolute",
              bottom: "clamp(2rem, 4vh, 3rem)",
              left: "clamp(1.5rem, 3vw, 2.5rem)",
              opacity: activeIndex === i ? 1 : 0,
              transition: "opacity 0.4s ease 0.2s",
            }}>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(4rem, 8vw, 7rem)",
                color: "rgba(255,255,255,0.12)",
                lineHeight: 1,
                margin: 0,
                letterSpacing: "0.02em",
              }}>
                {project.num}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
