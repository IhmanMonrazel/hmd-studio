import { useState } from "react";

const PROJECTS = [
  {
    title: "BOOKING CLUB",
    description: "Full-stack booking system for sports clubs",
    stack: "Rails / PostgreSQL / Stripe / Heroku",
    link: "/work/booking-club",
  },
  {
    title: "SAFEMOOV",
    description: "Real-time incident reporting app",
    stack: "Rails / JS / Cloudinary",
    link: "/work/safemoov",
  },
  {
    title: "PERSONAL PORTFOLIO",
    description: "Multilingual dev portfolio with auto-email",
    stack: "Rails / Google API / PostgreSQL",
    link: "/work/personal-portfolio",
  },
];

const CARD_W = 300;
const CARD_H = 400;

function getCardTransform(position) {
  // position: 0=center, 1=right, 2=left
  if (position === 0) {
    return {
      transform: "translateX(0px) rotateY(0deg) scale(1) translateZ(0px)",
      zIndex: 3,
      opacity: 1,
      cursor: "default",
    };
  }
  if (position === 1) {
    return {
      transform: "translateX(320px) rotateY(-18deg) scale(0.84) translateZ(-80px)",
      zIndex: 2,
      opacity: 0.82,
      cursor: "pointer",
    };
  }
  // position === 2 (left)
  return {
    transform: "translateX(-320px) rotateY(18deg) scale(0.84) translateZ(-80px)",
    zIndex: 2,
    opacity: 0.82,
    cursor: "pointer",
  };
}

export const CurvedCarousel = () => {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a + PROJECTS.length - 1) % PROJECTS.length);
  const next = () => setActive((a) => (a + 1) % PROJECTS.length);

  return (
    <div
      style={{
        width: "100%",
        minHeight: 540,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "40px 0 60px",
      }}
    >
      {/* Arc stage */}
      <div
        style={{
          position: "relative",
          width: CARD_W,
          height: CARD_H,
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {PROJECTS.map((project, i) => {
          const position = (i - active + PROJECTS.length) % PROJECTS.length;
          const style = getCardTransform(position);
          const isCenter = position === 0;
          const isRight = position === 1;
          const isLeft = position === 2;

          return (
            <div
              key={i}
              onClick={() => {
                if (isRight) next();
                if (isLeft) prev();
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CARD_W,
                height: CARD_H,
                background: "#ffffff",
                border: "1.5px solid #000000",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "28px 24px 24px",
                transformOrigin: "center center",
                transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease, z-index 0s",
                boxShadow: isCenter
                  ? "0 8px 40px rgba(0,0,0,0.12)"
                  : "0 2px 12px rgba(0,0,0,0.06)",
                ...style,
              }}
            >
              {/* Index */}
              <div>
                <p
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#CC0000",
                    marginBottom: 12,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                  }}
                >
                  0{i + 1}
                </p>

                {/* Title */}
                <h2
                  style={{
                    fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
                    fontSize: "2.2rem",
                    letterSpacing: "0.05em",
                    lineHeight: 1,
                    color: "#000000",
                    marginBottom: 16,
                  }}
                >
                  {project.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontSize: "0.82rem",
                    lineHeight: 1.7,
                    color: "rgba(0,0,0,0.6)",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 300,
                    marginBottom: 16,
                  }}
                >
                  {project.description}
                </p>

                {/* Divider */}
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    background: "rgba(0,0,0,0.1)",
                    marginBottom: 14,
                  }}
                />

                {/* Stack */}
                <p
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(0,0,0,0.4)",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {project.stack}
                </p>
              </div>

              {/* CTA */}
              {isCenter && (
                <button
                  onClick={() => { window.parent.location.href = project.link; }}
                  style={{
                    display: "inline-block",
                    background: "#000000",
                    color: "#ffffff",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.68rem",
                    fontWeight: 500,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "12px 20px",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "background 0.2s",
                    marginTop: 8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#CC0000")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#000000")}
                >
                  View Project →
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 48,
          alignItems: "center",
        }}
      >
        <button
          onClick={prev}
          style={{
            background: "none",
            border: "1.5px solid #000000",
            width: 44,
            height: 44,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            color: "#000000",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#000000";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#000000";
          }}
          aria-label="Previous"
        >
          ←
        </button>

        {/* Dots */}
        <div style={{ display: "flex", gap: 8 }}>
          {PROJECTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                background: i === active ? "#000000" : "rgba(0,0,0,0.2)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.3s ease, background 0.3s ease",
              }}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          style={{
            background: "none",
            border: "1.5px solid #000000",
            width: 44,
            height: 44,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            color: "#000000",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#000000";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#000000";
          }}
          aria-label="Next"
        >
          →
        </button>
      </div>
    </div>
  );
};
