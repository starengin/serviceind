import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function Home() {
  const nav = useNavigate();
  useReveal();

  const heroRef = useRef(null);
  const [par, setPar] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      setPar({ x: dx, y: dy });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const blobStyle = useMemo(() => {
    const x = Math.max(-1, Math.min(1, par.x));
    const y = Math.max(-1, Math.min(1, par.y));
    return {
      "--px": `${x * 16}px`,
      "--py": `${y * 12}px`,
    };
  }, [par]);

  return (
    <>
      <section ref={heroRef} className="heroFull" style={blobStyle}>
        <div className="heroBg" aria-hidden="true">
          <div className="heroBlob b1" />
          <div className="heroBlob b2" />
          <div className="heroBlob b3" />
          <div className="heroGrid" />
        </div>

        <div className="container heroFullInner">
          <div className="heroFullGrid">
            <div className="heroLeft" data-reveal>
              <div className="heroBadge">
                <span className="dot" />
                Fabrication • Installation • Industrial Work
              </div>

              <h1 className="heroTitle">
                Reliable <span className="gradText">Fabrication • Installation • Repair</span>
                <br />
                Support for Industrial & Commercial Projects
              </h1>

              <p className="heroLead">
                SERVICE INDIA delivers fabrication and industrial job work solutions
                for sheds, structures, gates, railings, roofing, platforms, repairs
                and custom site execution. We focus on proper workmanship, practical
                planning and dependable support for project timelines.
              </p>

              <div className="heroCtas">
                <Button onClick={() => nav("/work")}>Explore Work</Button>
                <button className="btnGhost heroGhost" onClick={() => nav("/contact")}>
                  Send Requirement
                </button>
              </div>
            </div>

            <div className="heroRight" data-reveal>
              <div className="heroPanel">
                <div className="panelHead">
                  <div className="panelTitle">What we do</div>
                  <div className="panelSub">Industrial fabrication & site execution</div>
                </div>

                <div className="pillGrid">
                  <div className="pill">Structural Fabrication</div>
                  <div className="pill">Shed & Roofing Work</div>
                  <div className="pill">Gate, Grill & Railing</div>
                  <div className="pill">Pipe Support & Utility Work</div>
                  <div className="pill">Platform, Ladder & Access Work</div>
                  <div className="pill">Repair & Retrofit Jobs</div>
                  <div className="pill">Installation & Erection</div>
                  <div className="pill">Custom Job Work</div>
                </div>

                <div className="panelFoot">
                  <div className="muted">Need drawing-based or site-based work?</div>
                  <button className="btnLink" onClick={() => nav("/contact")}>
                    Talk to Us →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <section className="trustStrip trustStrip--underHero" data-reveal>
            <div className="trustItem">
              <div className="trustBig">Fabrication</div>
              <div className="muted">Workshop & site support</div>
            </div>
            <div className="trustItem">
              <div className="trustBig">Execution</div>
              <div className="muted">Installation & erection jobs</div>
            </div>
            <div className="trustItem">
              <div className="trustBig">Repair</div>
              <div className="muted">Modification & maintenance</div>
            </div>
            <div className="trustItem">
              <div className="trustBig">Coordination</div>
              <div className="muted">Clear practical communication</div>
            </div>
          </section>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="sectionHead" data-reveal>
            <h2 className="h2">Where our work fits best</h2>
            <p className="sub">
              We support clients who need dependable fabrication and industrial execution for active jobs and running operations.
            </p>
          </div>

          <div className="tiles">
            {[
              { t: "Factories & Workshops", s: "Fabrication, modification, machine supports and utility jobs" },
              { t: "Warehouses & Industrial Sheds", s: "Roofing, cladding, extension and repair work" },
              { t: "Commercial & Site Projects", s: "Staircase, railing, gates, grills and structural support work" },
              { t: "Maintenance Teams", s: "Repair, retrofit and urgent correction jobs" },
              { t: "Contractors & Project Teams", s: "Execution support for planned and ongoing work" },
              { t: "Custom Requirement Clients", s: "Drawing-based, sample-based and site-specific fabrication" },
            ].map((x, i) => (
              <div className="tile" data-reveal key={i}>
                <div className="tileTitle">{x.t}</div>
                <div className="tileSub">{x.s}</div>
                <div className="tileLine" />
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="sectionHead" data-reveal>
            <h2 className="h2">Simple, practical work process</h2>
            <p className="sub">
              Built for fabrication, installation and industrial job execution with clear planning.
            </p>
          </div>

          <div className="steps">
            {[
              {
                n: "01",
                t: "Share requirement",
                s: "Send drawing, dimensions, site photos, work type and expected timeline.",
              },
              {
                n: "02",
                t: "Review & quotation",
                s: "We check scope, feasibility, execution method and provide commercial confirmation.",
              },
              {
                n: "03",
                t: "Fabrication / site planning",
                s: "Material, manpower, measurements and job sequence are aligned before execution.",
              },
              {
                n: "04",
                t: "Execution & completion",
                s: "Work is completed with coordination, updates and practical site support.",
              },
            ].map((x, i) => (
              <div className="step" data-reveal key={i}>
                <div className="stepNo">{x.n}</div>
                <div className="stepTitle">{x.t}</div>
                <div className="stepSub">{x.s}</div>
                <div className="stepGlow" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        <section className="ctaBand" data-reveal>
          <div className="ctaLeft">
            <h2 className="ctaTitle">Need fabrication or industrial work for your next job?</h2>
            <p className="ctaSub">
              Share your requirement, drawing or site details and we’ll help you with the right execution approach.
            </p>
          </div>

          <div className="ctaRight">
            <Button onClick={() => nav("/contact")}>Talk to Us</Button>
            <button className="btnGhost btnGhost--cta" onClick={() => nav("/work")}>
              Browse Work
            </button>
          </div>
        </section>

        <div style={{ height: 18 }} />
      </div>
    </>
  );
}