import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Helmet } from "react-helmet-async";

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

export default function About() {
  const nav = useNavigate();
  useReveal();

  return (
    <>
    <Helmet>
  <title>About Service India | Fabrication, Installation & Industrial Job Work in Mumbai</title>
  <meta
    name="description"
    content="Learn about Service India, a Mumbai-based fabrication, installation, repair and industrial job work company supporting factories, workshops, warehouses and project sites with practical execution."
  />
  <meta
    name="keywords"
    content="about Service India, fabrication company Mumbai, industrial job work Mumbai, installation company Mumbai, repair maintenance fabrication, structural fabrication company"
  />
  <link rel="canonical" href="https://www.serviceind.co.in/about" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="About Service India | Fabrication, Installation & Industrial Job Work in Mumbai" />
  <meta
    property="og:description"
    content="Know more about Service India and its fabrication, repair, installation and industrial execution support services in Mumbai."
  />
  <meta property="og:url" content="https://www.serviceind.co.in/about" />
  <meta property="og:site_name" content="Service India" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="About Service India | Fabrication, Installation & Industrial Job Work in Mumbai" />
  <meta
    name="twitter:description"
    content="About Service India and its fabrication, repair, installation and industrial work support in Mumbai."
  />
</Helmet>
      <section className="aboutBand aboutBand--blueprint">
        <div className="aboutBandBg" aria-hidden="true">
          <div className="abBlob a1" />
          <div className="abBlob a2" />
          <div className="abBlob a3" />
          <div className="abGrid" />
        </div>

        <div className="container aboutBandInner">
          <div className="aboutHeroBlock" data-reveal>
            <div className="heroBadge">
              <span className="dot" />
              Industrial • Fabrication • Site Execution
            </div>

            <h1 className="aboutH1">
              About <span className="gradText">SERVICE INDIA</span>
            </h1>

            <p className="aboutLead">
              SERVICE INDIA is focused on fabrication, installation, repair,
              maintenance and industrial job work solutions. We support factories,
              workshops, warehouses, commercial sites and project requirements with
              practical execution, dependable manpower and professional coordination.
            </p>

            <div className="aboutHeroActions">
              <Button onClick={() => nav("/contact")}>Send Requirement</Button>
              <button className="btnGhost btnGhost--cta" onClick={() => nav("/work")}>
                View Work Listing
              </button>
            </div>
          </div>

          <div className="aboutStats" data-reveal>
            <div className="statBox">
              <div className="statK">Fabrication Work</div>
              <div className="statS">MS • SS • GI structure jobs</div>
            </div>
            <div className="statBox">
              <div className="statK">Site Execution</div>
              <div className="statS">Installation • erection • fitting</div>
            </div>
            <div className="statBox">
              <div className="statK">Repair Support</div>
              <div className="statS">Modification • retrofit • maintenance</div>
            </div>
            <div className="statBox">
              <div className="statK">Custom Jobs</div>
              <div className="statS">As per drawing / site requirement</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="aboutSection" data-reveal>
          <div className="sectionHead">
            <h2 className="h2">Company Overview</h2>
            <p className="sub">
              We work as a practical execution partner for fabrication and
              industrial support jobs — focused on quality workmanship, timely
              completion and clear coordination.
            </p>
          </div>

          <div className="aboutTwoCol">
            <div className="aboutCardX">
              <h3 className="aboutH3">What we do</h3>
              <p className="aboutP">
                SERVICE INDIA handles structural fabrication, shed work, roofing,
                cladding, gates, grills, railings, platforms, pipe supports,
                machine frames, staircase fabrication and industrial installation work.
              </p>
              <p className="aboutP">
                We also support repair, retrofit, strengthening and custom job work
                as per drawing, site dimensions, sample or operational requirement.
                Whether the job is workshop-based or site-based, our focus remains on
                proper execution and reliable delivery.
              </p>
            </div>

            <div className="aboutCardX">
              <h3 className="aboutH3">Our journey (how we work)</h3>
              <div className="timeline">
                <div className="tlItem">
                  <div className="tlDot" />
                  <div>
                    <div className="tlTitle">Foundation</div>
                    <div className="tlSub">
                      Started with a practical approach to fabrication and industrial
                      service work, focused on quality execution and long-term trust.
                    </div>
                  </div>
                </div>

                <div className="tlItem">
                  <div className="tlDot" />
                  <div>
                    <div className="tlTitle">Expansion</div>
                    <div className="tlSub">
                      Expanded into structural jobs, shed work, repair work,
                      installation support and custom project execution.
                    </div>
                  </div>
                </div>

                <div className="tlItem">
                  <div className="tlDot" />
                  <div>
                    <div className="tlTitle">Execution-focused workflow</div>
                    <div className="tlSub">
                      Site visits, drawing-based work, measurement confirmation,
                      material planning and manpower coordination.
                    </div>
                  </div>
                </div>

                <div className="tlItem">
                  <div className="tlDot" />
                  <div>
                    <div className="tlTitle">Today</div>
                    <div className="tlSub">
                      Reliable fabrication and industrial work support for workshops,
                      warehouses, factories and project sites.
                    </div>
                  </div>
                </div>
              </div>

              <div className="aboutNote">
                <span className="pillMini">Note</span>
                <span className="muted">
                  Exact scope, material, finish and timeline are finalized as per
                  drawing, site condition and requirement.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="aboutSection" data-reveal>
          <div className="sectionHead">
            <h2 className="h2">Why clients choose us?</h2>
            <p className="sub">
              We focus on dependable execution for industrial and fabrication jobs —
              not just basic labour supply.
            </p>
          </div>

          <div className="aboutGrid3">
            {[
              {
                t: "Requirement-first approach",
                s: "We understand drawing, dimensions, site conditions and execution needs before starting work.",
              },
              {
                t: "Practical fabrication support",
                s: "From structural work to custom jobs, solutions are planned according to actual usage and site fitment.",
              },
              {
                t: "Clear execution planning",
                s: "Work scope, timeline, manpower and installation sequence are coordinated in a practical manner.",
              },
              {
                t: "Site + workshop capability",
                s: "Jobs can be handled in workshop fabrication mode, on-site execution mode, or combined support.",
              },
              {
                t: "Repair and modification support",
                s: "Existing structures, sheds, supports and industrial works can be repaired, strengthened or modified.",
              },
              {
                t: "Professional coordination",
                s: "Communication remains clear throughout requirement discussion, work execution and completion stage.",
              },
            ].map((x, i) => (
              <div className="whyCard" data-reveal key={i}>
                <div className="whyTop">
                  <span className="whyDot" aria-hidden="true" />
                  <div className="whyTitle">{x.t}</div>
                </div>
                <div className="whySub">{x.s}</div>
                <div className="whyBar" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        <section className="aboutSection" data-reveal>
          <div className="sectionHead">
            <h2 className="h2">How work execution happens</h2>
            <p className="sub">
              Simple process designed for fabrication, installation and industrial site work.
            </p>
          </div>

          <div className="steps">
            {[
              {
                n: "01",
                t: "Requirement discussion",
                s: "Share drawing, dimensions, work type, site location, quantity and expected timeline.",
              },
              {
                n: "02",
                t: "Review & planning",
                s: "We study scope, confirm execution method, manpower need, material requirement and practical feasibility.",
              },
              {
                n: "03",
                t: "Quotation / approval",
                s: "Commercials, work scope and timeline are finalized before fabrication or site execution begins.",
              },
              {
                n: "04",
                t: "Execution & completion",
                s: "Fabrication, fitting, installation, repair or erection work is completed with proper coordination and updates.",
              },
            ].map((x, i) => (
              <div className="step step--alt" data-reveal key={i}>
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
            <h2 className="ctaTitle">Need fabrication or industrial work support?</h2>
            <p className="ctaSub">
              Share your drawing, dimensions or site requirement and we’ll respond
              with the right execution approach.
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