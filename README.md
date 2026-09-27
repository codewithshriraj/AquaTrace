# AquaTrace

### Explainable Maritime Oil Spill Traceback & Vessel Attribution

> **Satellite intelligence for detecting maritime oil slicks, reconstructing likely release regions, correlating vessel activity, testing candidate hypotheses, and producing an auditable evidence chain under uncertainty.**

---

## Overview

**AquaTrace** is an explainable decision-support platform designed to bridge the investigative gap between initial satellite detection of an ocean surface oil slick and actionable, auditable candidate vessel correlation.

Conventional approaches frequently commit the fundamental error of assuming that the vessel nearest to an observed slick at the time of satellite acquisition was the source of the discharge. In reality, ocean currents, surface winds, and Stokes drift transport and deform oil slicks over hours or days, displacing the observed surface anomaly tens of nautical miles from its actual point of origin.

AquaTrace reconstructs the spill backwards in time using analytical and numerical hydrodynamic drift models, identifies candidate vessels transiting the modelled origin envelope during the estimated release window, validates candidate hypotheses via counterfactual forward simulation, and combines multi-channel evidence into an explainable **Composite Evidence Score** under strict human-in-the-loop oversight.

When data coverage is incomplete or look-alike risks are elevated, **AquaTrace explicitly abstains by issuing an INCONCLUSIVE finding**, preventing unverified allegations.

---

## SIH 2026 Problem Statement

* **Initiative:** Smart India Hackathon 2026
* **Problem Statement ID:** SIH26143 (PS 143)
* **Organization:** National Technical Research Organisation (NTRO)
* **Theme:** Disaster Management
* **Team:** Code Blooded
* **Status:** Exploratory Demonstration Prototype

### Official Problem Statement

> *“Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations to identify vessel responsible for the spill.”*

*Notice: AquaTrace is an academic and technological hackathon demonstration prototype developed to address the technical challenges posed in SIH26143. It is not an officially certified government system or deployed operational platform.*

---

## Why the Problem Is Difficult

Attributing maritime oil pollution from space involves severe scientific and operational bottlenecks:

1. **Spatial and Temporal Drift Gap:** By the time a satellite sensor passes overhead, ocean currents and winds have transported the slick 10–50+ kilometers away from the original discharge location. Direct spatial proximity at detection time is scientifically misleading.
2. **Incomplete Vessel Telemetry:** Commercial vessels can experience AIS transponder silence, signal collisions in dense shipping lanes, or terrestrial antenna blind spots in coastal shadow zones and open seas. A missing AIS record cannot automatically be interpreted as culpability.
3. **Radar Look-Alikes:** Low-wind ocean patches, natural biogenic sheens (algal blooms, fish oils), internal waves, and coastal sediment plumes dampen capillary waves and produce SAR backscatter damping identical to mineral oil slicks. Automated systems that force positive verdicts risk severe false accusations.
4. **Counterfactual Non-Uniqueness:** Multiple vessels transiting a shipping lane around the same timeframe may have trajectories that could theoretically align with observed drift. Disentangling candidates requires multi-channel evidence fusion rather than single-variable correlation.

---

## AquaTrace Workflow

AquaTrace implements a rigorous 9-stage investigative pipeline:

```text
DETECT → CHARACTERISE → HINDCAST → FORECAST → CORRELATE → INVESTIGATE → VERIFY → ATTRIBUTE → ABSTAIN
```

1. **DETECT:** Identify candidate slick geometry and anomalous dark formations on open ocean surfaces using high-resolution Synthetic Aperture Radar (SAR) imagery.
2. **CHARACTERISE:** Measure geometry, surface area, and weathering state while screening for natural look-alikes.
3. **HINDCAST:** Reconstruct the likely origin region and release-time window by reversing ocean currents and wind advection.
4. **FORECAST:** Project potential forward dispersion cones over 24–72 hours to assess proximity to sensitive marine ecosystems and aquaculture.
5. **CORRELATE:** Search historical AIS vessel telemetry within the reconstructed origin spacetime bounding box during the estimated release window.
6. **INVESTIGATE:** Analyse vessel kinematics, speed profile anomalies, track deviations, and flag AIS continuity gaps against radar metallic targets.
7. **VERIFY:** Run candidate-specific counterfactual simulations: inject virtual particles along candidate tracks to evaluate whether simulated dispersion reproduces the observed SAR footprint.
8. **ATTRIBUTE:** Fuse six independent evidence channels into an auditable **Composite Evidence Score** (0–100) using transparent operational weighting.
9. **ABSTAIN:** Formally return **INCONCLUSIVE** when look-alike risk is high, telemetry is sparse, or candidate separation is ambiguous.

---

## Key Innovations

AquaTrace introduces seven core scientific and architectural innovations:

1. **Modelled Origin-Time Uncertainty:** Reconstructs spill origin using P50, P80, and P95 modelled spatial uncertainty envelopes and a release-time window. *These are modelled uncertainty bounds for investigation, not calibrated statistical probabilities.*
2. **Candidate-Specific Counterfactual Simulation:** Evaluates candidate hypotheses by simulating a hypothetical release from the vessel's coordinates and timestamp, measuring Spatial IoU, Hausdorff distance, shape similarity, and drift consistency against the observed slick.
3. **Explainable Evidence Fusion:** Combines six independent analytical channels using transparent operational weighting:
   * Satellite Radar Contrast & Morphology: **20%**
   * Lagrangian Drift Hindcast Convergence: **25%**
   * AIS Spatiotemporal Proximity: **20%**
   * Kinematic Anomaly & Speed Profile: **10%**
   * Counterfactual Forward Match: **20%**
   * Historical Port State Control Context: **5%**
   *(Result is an Operational Composite Evidence Score out of 100, not a probability of guilt).*
4. **AIS / SAR Discrepancy Analysis:** Identifies kinematic and AIS continuity anomalies by cross-referencing SAR high-backscatter metallic targets against broadcast records without premature assumptions regarding intent.
5. **Evidentiary Provenance Graph:** Constructs an acyclic directed graph tracing the exact lineage: `Satellite Scene → Slick → Origin → Environmental Inputs → Drift → AIS → Candidate → Counterfactual → Evidence Fusion → Finding`.
6. **Principled Abstention (INCONCLUSIVE):** Enforces an evidence sufficiency governor that returns INCONCLUSIVE whenever evidence is inadequate, avoiding forced false positives.
7. **Forensic Replay & Evolution:** Scrub through the multi-hour investigation timeline to inspect how evidence accumulated as data streams became available.

---

## Demonstration Cases

AquaTrace includes canonical demonstration scenarios illustrating distinct operational uncertainty profiles:

### Incident OS-042 — Arabian Sea Offshore Corridor

* **Location:** Arabian Sea (18.42°N, 71.18°E), Mumbai offshore transit fairway
* **Observation:** Sentinel-1C C-SAR IW Mode (10m ground resolution)
* **Slick Properties:** Area 14.85 km², Estimated Volume ~420 m³, Estimated Age 4.5–6.0 hrs
* **Reconstructed Release Window:** 08:45–10:15 UTC (Modelled origin centroid: 18.26°N, 70.92°E)
* **Candidate Fleet Screening:** 48 regional vessels filtered to 3 candidate vessels
* **Top-Ranked Candidate:** MT AL-HIKMA (Crude Oil Tanker, MMSI 477291000)
  * Transited origin P50 envelope during release window (CPA: 0.38 nm at 09:22 UTC)
  * Speed anomaly: Decelerated from 14.2 kts to 8.4 kts for 42 minutes within the origin envelope
  * Counterfactual Simulation: **Spatial IoU 84.2%**, **Hausdorff Distance 1.15 km**, **Shape Similarity 91.4%**
  * **Composite Evidence Score: 89.9 / 100 (HIGH CORRELATION)**
  * *Note: Operational evidence weighting; not statistically calibrated against empirical ground-truth base rates.*

### Incident OS-037 — Gulf of Mannar Protected Shoal

* **Location:** Gulf of Mannar / Palk Bay Shipping Channel (8.85°N, 79.12°E)
* **Observation:** EOS-04 C-band FRS-1 Mode (12.5m resolution)
* **Slick Properties:** Area 6.4 km², Radar contrast damping 3.2 dB, Surface wind 2.1 m/s (~4.1 kts)
* **Investigation Findings:**
  * Radar damping and low wind lie directly within natural biogenic sheen overlap.
  * Terrestrial AIS receiver shadow zone across the sector produced a 145-minute telemetry gap.
  * Weak separation among candidate coastal vessels.
* **Finding:** **INCONCLUSIVE (Principled Abstention)**
  * The system intentionally abstains to prevent unverified allegations against coastal shipping.

---

## Architecture

AquaTrace employs a modular, decoupled full-stack architecture separating geospatial visualisation, trajectory modeling, and evidence synthesis:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   AQUATRACE MARITIME WORKSTATION                       │
│     React 18 + TypeScript + Custom GIS Engine + Editorial Design       │
├───────────────────────────────────┬────────────────────────────────────┤
│       PRESENTATION LAYER          │         EVIDENTIARY AUDIT          │
│ • Interactive Multi-Layer Map     │ • Evidentiary Provenance DAG       │
│ • Spatiotemporal Replay Slider    │ • Multi-Factor Scoring Matrix      │
│ • Candidate Comparison Drawer     │ • 20-Section Standalone PDF Engine │
├───────────────────────────────────┴────────────────────────────────────┤
│                     ANALYTICAL PROCESSING ENGINES                      │
│ • Reverse Lagrangian Drift Hindcaster (P50/P80/P95 Envelopes)          │
│ • Forward Hydrodynamic Dispersion Forecaster                           │
│ • Counterfactual Release Simulation & IoU / Hausdorff Evaluator        │
│ • Evidence Sufficiency Governor & Abstention Logic                     │
├────────────────────────────────────────────────────────────────────────┤
│                          DATA SOURCES & MODELS                         │
│ • SAR Geometry (Pre-vectorised demonstration reference)                │
│ • AIS Telemetry (Synthetic demonstration trajectories)                 │
│ • Metocean Forcing (Simulated ERA5 wind & CMEMS ocean current fields)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

* **Frontend Framework:** React 18, TypeScript, Vite
* **Styling & Design System:** Custom Swiss/Editorial GIS CSS (design tokens, zero bloat)
* **Geospatial & Canvas Engine:** Leaflet, HTML5 Canvas vector overlay
* **Icons & Visual Language:** Lucide React
* **Reporting Engine:** jsPDF (Client-side 20-section forensic PDF generation)
* **Code Quality & Testing:** TypeScript strict mode, Oxlint, automated verification scripts

---

## Data Sources

| Stream | Operational Role | Current Prototype Implementation | Production Integration Target |
| :--- | :--- | :--- | :--- |
| **SAR Imagery** | Surface oil slick segmentation & metallic hull detection | Pre-vectorised Sentinel-1 & EOS-04 demonstration scenes | Automated ESA Copernicus Hub & ISRO Bhoovan downlink |
| **AIS Telemetry** | Historical vessel tracking & CPA correlation | Synthetic demonstration trajectories with realistic kinematics | Live terrestrial & satellite AIS feeds (Spire, MarineTraffic) |
| **Ocean Currents** | Lagrangian advection & dispersion | Simulated 2D velocity fields based on seasonal hydrodynamics | Copernicus Marine Service (CMEMS) 3D Global Ocean Analysis |
| **Surface Winds** | Windage drift (3% rule) & look-alike screening | Simulated 10m wind velocity vectors | ECMWF ERA5 reanalysis & GFS numerical weather prediction |
| **Bathymetry** | Shoreline contact & coastal grounding constraints | Pre-compiled vector boundaries & marine protected areas | GEBCO high-resolution global bathymetry grid |

---

## Current Prototype vs Production Targets

To maintain complete scientific and engineering honesty, AquaTrace explicitly distinguishes between its current demonstration state and planned production deployments:

| Dimension | Current Demonstration Prototype | Production Integration Target |
| :--- | :--- | :--- |
| **Runtime Environment** | In-browser client-side application | Distributed cloud microservices (FastAPI / Docker / Celery) |
| **SAR Processing** | Pre-vectorised benchmark geometries (Zenodo dataset reference) | Automated segmentation via SegFormer-B4 / U-Net on GPUs |
| **AIS Ingestion** | Synthetic multi-vessel scenarios with controlled kinematics | High-throughput streaming AIS ingestion via DuckDB & PostGIS |
| **Drift Computation** | Lightweight analytical reverse-advection and forward models | Production OpenDrift / OpenOil integration & NOAA GNOME cross-check |
| **Attribution Output** | Operational Composite Evidence Score (0–100) | Bayesian probability estimation calibrated against ground-truth inspection logs |
| **Target Users** | Hackathon evaluators & technical reviewers | Port State Control (PSC) inspectors & Indian Coast Guard maritime centers |

---

## Scientific & Operational Limitations

1. **Decision Support Only:** AquaTrace outputs are investigative intelligence briefs intended to prioritize physical inspections (e.g., Port State Control boarding, oily water separator logbook reviews, bilge sampling). It does not autonomously determine legal liability.
2. **Operational Scoring vs Statistical Probability:** The Composite Evidence Score is a weighted multi-criteria heuristic reflecting operational confidence. It is not an empirically calibrated posterior probability.
3. **Drift Model Uncertainty:** Reconstructed origins represent stochastic bounds dependent on metocean data resolution. Real-world sub-mesoscale eddies and coastal bathymetric steering introduce variances captured by P50/P80/P95 envelopes.
4. **AIS Dependency:** If a vessel operates with disabled AIS outside radar coverage, identification depends on dark-vessel radar cross-matching, which requires high-resolution SAR target detection.

---

## Demonstration Mode

AquaTrace currently runs in **Demonstration Mode**. All incidents, telemetry points, and simulated environmental fields are deterministic demonstration cases crafted to validate system logic and presentation fidelity. Demonstration metrics illustrate analytical capabilities and are not presented as ground-truth real-world attributions.

---

## Running Locally

### Prerequisites

* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/codewithshriraj/AquaTrace.git

# Navigate into the project directory
cd AquaTrace

# Install dependencies
npm install
```

### Development Server

```bash
# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Production Build & Verification

```bash
# Type check and build production bundle
npm run build

# Verify standalone 20-section PDF generation suite
npx tsx scripts/verifyPdf.ts
```

---

## Project Structure

```text
AquaTrace/
├── public/                     # Static media and background video assets
├── scripts/
│   └── verifyPdf.ts            # Automated PDF export validation suite
├── src/
│   ├── components/
│   │   ├── console/            # Investigator workstation views
│   │   │   ├── InvestigationMap.tsx        # Geospatial GIS map & layers
│   │   │   ├── CandidateDrawer.tsx         # Vessel inspection panel
│   │   │   ├── EvidenceProvenanceDAG.tsx   # Evidentiary graph viewer
│   │   │   ├── InvestigationReportModal.tsx# Printable 20-section report
│   │   │   ├── ReplayControls.tsx          # Spatiotemporal replay bar
│   │   │   ├── AuditTrailDrawer.tsx        # Cryptographic event audit
│   │   │   └── SettingsView.tsx            # Weighting & abstention tuning
│   │   └── landing/            # Public-facing presentation components
│   │       ├── LandingPage.tsx             # Main landing overview
│   │       ├── WorkflowExplorer.tsx        # 9-stage pipeline explorer
│   │       ├── InnovationShowcase.tsx      # 7 core innovations showcase
│   │       ├── ImpactSection.tsx           # Operational value & decision support
│   │       ├── TechArchitecture.tsx        # System architecture & prototype vs target
│   │       └── DemoIncidentsSection.tsx    # Canonical demonstration cases
│   ├── data/
│   │   ├── mockIncidents.ts    # Canonical incident registries (OS-042, OS-037)
│   │   ├── mockVessels.ts      # AIS telemetry & candidate records
│   │   └── coastalBoundaries.ts# Geospatial reference contours
│   ├── services/
│   │   ├── attributionEngine.ts# Multi-channel evidence weighting
│   │   ├── driftSimulator.ts   # Analytical reverse & forward drift
│   │   └── pdfExporter.ts      # Standalone 20-section PDF generator
│   ├── types/
│   │   └── index.ts            # Domain TypeScript interfaces & types
│   ├── App.tsx                 # Root application router
│   ├── index.css               # Swiss/Editorial GIS design system
│   └── main.tsx                # Application entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Team

**Team Code Blooded** — Smart India Hackathon 2026 (SIH26143)
* Focus: Satellite remote sensing, geospatial intelligence, hydrodynamic modeling, explainable machine learning.

---

## License

This project is licensed under the [MIT License](LICENSE).
