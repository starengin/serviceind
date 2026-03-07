import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

/* ✅ Same reveal system as Home */
function useReveal(deps = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return;

    const targets = els.filter((el) => !el.classList.contains("is-in"));

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

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const CTA_TEXT = "Send Requirement →";

const WORK_TYPES = [
  { key: "ALL", label: "All Works" },
  { key: "FABRICATION", label: "Fabrication" },
  { key: "INSTALLATION", label: "Installation" },
  { key: "ERECTION", label: "Erection" },
  { key: "REPAIR", label: "Repair & Maintenance" },
  { key: "SHEET", label: "Roofing & Cladding" },
  { key: "PIPE", label: "Pipe & Structural Works" },
  { key: "CUSTOM", label: "Custom Job Works" },
];

const WORK_CATALOG = [
  {
    id: "structural-fabrication",
    title: "STRUCTURAL FABRICATION WORK",
    img: "/work/structural-fabrication.png",
    category: "FABRICATION",
    materials: ["MS", "SS", "GI"],
    use: "Heavy and light structural fabrication for sheds, platforms, mezzanine floors, machine supports, columns, beams and industrial frameworks.",
    scope: [
      "Column, beam, truss and platform fabrication",
      "Industrial structure manufacturing as per drawing",
      "Base frame, support frame and heavy duty fabrication",
    ],
    supply: [
      "Job work only",
      "Labour with material",
      "Site fabrication and dispatch support",
    ],
    note: "Share drawing, dimensions, load application and site location for quick costing.",
    tags: ["shed", "structure", "platform", "beam"],
  },
  {
    id: "shed-work",
    title: "INDUSTRIAL SHED & ROOFING WORK",
    img: "/work/shed-roofing.png",
    category: "SHEET",
    materials: ["GI", "PPGI", "PPGL", "MS"],
    use: "Complete industrial shed fabrication, roofing sheet fixing, cladding and extension work for factories, warehouses and workshops.",
    scope: [
      "Roofing sheet installation and replacement",
      "Wall cladding and side covering work",
      "Shed extension, repair and strengthening",
    ],
    supply: [
      "New shed work",
      "Repair and replacement work",
      "Custom sheet length and structure support",
    ],
    note: "Send shed size, height, roofing type and site photos if available.",
    tags: ["roofing", "cladding", "shed", "warehouse"],
  },
  {
    id: "gate-grill",
    title: "GATE, GRILL & RAILING FABRICATION",
    img: "/work/gate-grill.png",
    category: "FABRICATION",
    materials: ["MS", "SS", "GI"],
    use: "Custom fabrication for main gates, safety grills, staircase railings, balcony railings and boundary protection systems.",
    scope: [
      "Sliding gate, swing gate and industrial gate fabrication",
      "Window grill, safety grill and partition work",
      "Railing fabrication for staircase, balcony and platform",
    ],
    supply: [
      "Workshop fabrication",
      "Site fitting and installation",
      "Primer/paint/polish finish options",
    ],
    note: "Share design, opening size, material choice and finish requirement.",
    tags: ["gate", "grill", "railing", "staircase"],
  },
  {
    id: "pipe-pipeline",
    title: "PIPELINE, PIPE SUPPORT & PIPING WORK",
    img: "/work/piping.png",
    category: "PIPE",
    materials: ["MS", "GI", "SS"],
    use: "Fabrication and installation of pipe lines, pipe supports, utility lines, pipe racks and industrial routing structures.",
    scope: [
      "Pipe support and clamp fabrication",
      "Utility pipeline routing and fitting work",
      "Pipe rack and support stand fabrication",
    ],
    supply: [
      "Fabrication as per site layout",
      "Installation and line support work",
      "Repair/modification of existing lines",
    ],
    note: "Best if you share pipe size, line purpose, support spacing and layout/photo.",
    tags: ["pipeline", "pipe rack", "support", "utility"],
  },
  {
    id: "tank-platform",
    title: "TANK, PLATFORM & ACCESS FABRICATION",
    img: "/work/tank-platform.png",
    category: "FABRICATION",
    materials: ["MS", "SS"],
    use: "Fabrication of tanks, service platforms, ladders, access structures, walkways and maintenance support systems.",
    scope: [
      "Tank stand and access platform fabrication",
      "Ladder, cage ladder and walkway fabrication",
      "Maintenance and machine access support structures",
    ],
    supply: [
      "Factory fabricated and site assembled options",
      "Custom platform sizes",
      "Load-based fabrication solutions",
    ],
    note: "Send platform size, working height, load requirement and usage purpose.",
    tags: ["tank", "platform", "ladder", "walkway"],
  },
  {
    id: "machine-base",
    title: "MACHINE BASE, FRAME & CUSTOM JOB WORK",
    img: "/work/machine-base.png",
    category: "CUSTOM",
    materials: ["MS", "SS"],
    use: "Custom fabrication for machine bases, skid frames, equipment stands, support tables and one-off industrial job work.",
    scope: [
      "Machine base frame and skid fabrication",
      "Custom stands, supports and production tables",
      "Fabrication as per sample, sketch or drawing",
    ],
    supply: [
      "One-piece and bulk job work",
      "Precision fabrication support",
      "Dispatch-ready finished fabrication",
    ],
    note: "You can send drawing, rough sketch or reference image for quotation.",
    tags: ["machine", "frame", "custom", "job work"],
  },
  {
    id: "erection-installation",
    title: "ERECTION & INSTALLATION WORK",
    img: "/work/erection.png",
    category: "INSTALLATION",
    materials: ["MS", "SS", "GI"],
    use: "On-site erection and installation of fabricated structures, supports, sheds, railings, platforms and industrial assemblies.",
    scope: [
      "Site erection of structures and shed members",
      "Alignment, fitting and installation work",
      "Welding, bolting and assembly support",
    ],
    supply: [
      "Only labour erection",
      "Fabrication + erection package",
      "Shutdown and urgent site work support",
    ],
    note: "Share site location, material readiness, manpower scope and expected timeline.",
    tags: ["erection", "installation", "site work", "assembly"],
  },
  {
    id: "repair-maintenance",
    title: "REPAIR, RETROFIT & MAINTENANCE WORK",
    img: "/work/repair.png",
    category: "REPAIR",
    materials: ["MS", "SS", "GI"],
    use: "Repairing damaged steel structures, modifying existing fabrication and maintenance support for plant and industrial work.",
    scope: [
      "Crack repair, strengthening and modification work",
      "Old structure retrofitting and replacement support",
      "Industrial maintenance and emergency fabrication",
    ],
    supply: [
      "Breakdown support jobs",
      "Strengthening and corrective work",
      "Short shutdown maintenance fabrication",
    ],
    note: "Share current issue, photos, dimensions and urgency level for faster planning.",
    tags: ["repair", "maintenance", "retrofit", "modification"],
  },
  {
    id: "staircase-loft",
    title: "STAIRCASE, LOFT & UTILITY FABRICATION",
    img: "/work/staircase-loft.png",
    category: "CUSTOM",
    materials: ["MS", "SS"],
    use: "Fabrication for metal staircases, loft structures, utility racks, storage supports and internal access systems.",
    scope: [
      "Straight and custom staircase fabrication",
      "Loft platform and storage support structures",
      "Rack frames and utility support fabrication",
    ],
    supply: [
      "Custom size fabrication",
      "Installation at site",
      "Paint and finish options available",
    ],
    note: "Send floor height, usable width, load use and finish preference.",
    tags: ["staircase", "loft", "rack", "utility"],
  },
];

function Chip({ children }) {
  return <span className="chip">{children}</span>;
}

export default function Work() {
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [type, setType] = useState("ALL");

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();

    return WORK_CATALOG.filter((it) => {
      const matchQ =
        !query ||
        it.title.toLowerCase().includes(query) ||
        it.use.toLowerCase().includes(query) ||
        (it.tags || []).join(" ").toLowerCase().includes(query) ||
        (it.materials || []).join(" ").toLowerCase().includes(query);

      const matchType = type === "ALL" || it.category === type;
      return matchQ && matchType;
    });
  }, [q, type]);

  useReveal([type, q, items.length]);

  const onCta = (itemTitle) => {
    nav("/contact", { state: { subject: `Requirement: ${itemTitle}` } });
  };

  return (
    <div className="container">
      <div className="shopTop" data-reveal>
        <div>
          <div className="heroBadge" style={{ marginBottom: 10 }}>
            <span className="dot" />
            SERVICE INDIA • Industrial Fabrication Works
          </div>

          <h1 className="h1">
            Works We Handle:{" "}
            <span className="gradText">Fabrication • Installation • Repair</span>
          </h1>

          <p className="sub">
            SERVICE INDIA provides fabrication and industrial job work solutions
            for sheds, structures, gates, railings, piping supports, platforms,
            repairs and custom site works. Share your requirement and we’ll
            connect with the right solution.
          </p>
        </div>

        <div className="shopFilters" data-reveal>
          <input
            className="shopSearch"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search work type (e.g., shed, railing, platform, repair...)"
          />

          <select
            className="shopSelect"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {WORK_TYPES.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>

          <button className="btnGhost shopContactBtn" onClick={() => nav("/contact")}>
            Contact Us →
          </button>
        </div>
      </div>

      <div className="shopGrid">
        {items.map((it) => (
          <article className="shopCard" key={it.id} data-reveal>
            <div className="shopImgWrap">
              <img
                src={it.img}
                alt={it.title}
                className="shopImg"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/products/placeholder.jpg";
                }}
              />
            </div>

            <div className="shopBody">
              <h3 className="shopTitle">{it.title}</h3>

              <div className="shopChips">
                {(it.materials || []).map((m) => (
                  <Chip key={m}>{m}</Chip>
                ))}
              </div>

              <div className="shopSection">
                <div className="shopLabel">Work details</div>
                <div className="shopText">{it.use}</div>
              </div>

              <div className="shopSection">
                <div className="shopLabel">Scope of work</div>
                <ul className="shopList">
                  {it.scope.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="shopSection">
                <div className="shopLabel">Execution options</div>
                <ul className="shopList">
                  {it.supply.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="shopNote">{it.note}</div>

              <div className="shopActions">
                <Button className="btnAnim btnAttachTheme" onClick={() => onCta(it.title)}>
                  {CTA_TEXT}
                </Button>

                <button className="btnGhost" onClick={() => nav("/contact")}>
                  Request a Call →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div style={{ height: 18 }} />

      <style>{`
        .shopTop{
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap:14px;
          flex-wrap:wrap;
          margin-top: 8px;
        }

        .shopFilters{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          align-items:center;
          justify-content:flex-end;
        }

        .shopSearch{
          height: 44px;
          min-width: 320px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(255,255,255,.88);
          outline: none;
          font-family: Arial, Helvetica, sans-serif;
        }

        .shopSearch:focus{
          border-color: rgba(24,144,255,.30);
          box-shadow: 0 12px 28px rgba(24,144,255,.10);
        }

        .shopSelect{
          height:44px;
          padding: 0 12px;
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(255,255,255,.88);
          outline: none;
          font-family: Arial, Helvetica, sans-serif;
        }

        .shopContactBtn{
          height:44px;
          border-radius: 14px;
          padding: 0 14px;
          background: rgba(255,255,255,.92);
        }

        .shopGrid{
          margin-top: 14px;
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 980px){
          .shopGrid{ grid-template-columns: 1fr; }
          .shopSearch{ min-width: 240px; width: 100%; }
          .shopFilters{ width: 100%; justify-content:flex-start; }
        }

        .shopCard{
          border-radius: 22px;
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(255,255,255,.80);
          box-shadow: 0 10px 30px rgba(2,6,23,.06);
          overflow:hidden;
          display:flex;
          flex-direction:column;
          backdrop-filter: blur(6px);
        }

        .shopImgWrap{
          height: 180px;
          background:
            linear-gradient(135deg,
              rgba(27,126,231,.18) 0%,
              rgba(26,179,255,.15) 45%,
              rgba(243,176,43,.20) 100%);
          border-bottom: 1px solid rgba(15,23,42,.08);
          overflow:hidden;
        }

        .shopImg{
          width:100%;
          height:100%;
          object-fit: cover;
          display:block;
          transform: scale(1.02);
        }

        .shopBody{
          padding: 14px;
          display:flex;
          flex-direction:column;
          gap: 10px;
        }

        .shopTitle{
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }

        .shopChips{
          display:flex;
          gap:8px;
          flex-wrap:wrap;
        }

        .chip{
          display:inline-flex;
          align-items:center;
          height: 26px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(255,255,255,.92);
          color: #0f172a;
        }

        .shopSection{
          display:grid;
          gap:4px;
        }

        .shopLabel{
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
        }

        .shopText{
          color:#334155;
          line-height:1.6;
          font-size: 13px;
        }

        .shopList{
          margin:0;
          padding-left: 16px;
          color:#334155;
          line-height:1.7;
          font-size: 13px;
        }

        .shopNote{
          margin-top: 2px;
          border: 1px solid rgba(15,23,42,.08);
          background: linear-gradient(
            135deg,
            rgba(27,126,231,.06),
            rgba(26,179,255,.04),
            rgba(243,176,43,.08)
          );
          border-radius: 14px;
          padding: 10px 12px;
          color: #475569;
          line-height: 1.6;
          font-size: 12.5px;
        }

        .shopActions{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top: 6px;
        }

        .btnAttachTheme{
          border: none !important;
          color: #fff !important;
          background: linear-gradient(90deg, #1d7fe8 0%, #17b3ff 55%, #e5a52b 100%) !important;
          box-shadow: 0 12px 30px rgba(29,127,232,.22);
          transition: transform .14s ease, box-shadow .18s ease, filter .18s ease;
        }

        .btnAttachTheme:hover{
          transform: translateY(-1px);
          box-shadow: 0 16px 36px rgba(29,127,232,.28);
          filter: saturate(1.05);
        }

        .btnAttachTheme:active{
          transform: translateY(0) scale(.99);
        }

        .shopActions .btnGhost{
          height: 44px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,.12);
          background: rgba(255,255,255,.90);
          font-weight: 700;
          font-family: Arial, Helvetica, sans-serif;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          transition: transform .12s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
        }

        .shopActions .btnGhost:hover{
          border-color: rgba(29,127,232,.24);
          box-shadow: 0 10px 24px rgba(29,127,232,.10);
          transform: translateY(-1px);
        }

        .shopActions .btnGhost:active{
          transform: translateY(0px) scale(.99);
        }

.gradText{
  background-image: linear-gradient(
    90deg,
    #1f7fe8 0%,
    #22b8ff 30%,
    #d6a138 58%,
    #1f7fe8 82%,
    #22b8ff 100%
  );
  background-size: 280% 280%;
  animation: starShift 4.5s linear infinite;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  display: inline-block;
}
      `}</style>
    </div>
  );
}