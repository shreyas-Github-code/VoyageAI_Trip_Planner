import { useState, useEffect, useRef } from "react";

const API = "http://localhost:8000";

// ── Fonts ──────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --sand: #f5efe6;
    --sand-dark: #ede3d4;
    --ink: #1a1510;
    --ink-light: #3d3428;
    --amber: #c8873a;
    --amber-light: #e8a855;
    --amber-pale: #fdf3e3;
    --teal: #2d6e6e;
    --teal-light: #4a9494;
    --red-accent: #c0392b;
    --white: #fdfaf6;
    --shadow: 0 4px 32px rgba(26,21,16,0.12);
    --shadow-lg: 0 12px 64px rgba(26,21,16,0.18);
  }

  body { background: var(--sand); font-family: 'DM Sans', sans-serif; color: var(--ink); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes pulse-dot {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.4); opacity: 0.6; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .app {
    min-height: 100vh;
    background: var(--sand);
    position: relative;
    overflow-x: hidden;
  }
  .app-selection-mode {
    padding-bottom: 112px;
  }

  /* ── Paper texture overlay ── */
  .app::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0;
  }

  /* ── Header ── */
  .header {
    position: sticky; top: 0; z-index: 100;
    background: var(--ink);
    padding: 0 40px;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.3);
  }
  .header-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 900; font-style: italic;
    color: var(--amber-light);
    letter-spacing: -0.5px;
  }
  .header-logo span { color: var(--white); font-style: normal; }
  .header-steps { display: flex; gap: 8px; align-items: center; }
  .step-pill {
    padding: 4px 14px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 500; letter-spacing: 0.5px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    cursor: default;
  }
  .step-pill.done   { background: var(--teal); color: white; }
  .step-pill.active { background: var(--amber); color: white; }
  .step-pill.todo   { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); }

  /* ── Ticker tape ── */
  .ticker {
    background: var(--amber); overflow: hidden; height: 34px;
    display: flex; align-items: center;
  }
  .ticker-inner {
    display: flex; white-space: nowrap;
    animation: marquee 28s linear infinite;
    font-size: 0.75rem; font-weight: 500; letter-spacing: 2px;
    text-transform: uppercase; color: var(--ink);
  }
  .ticker-item { padding: 0 40px; }
  .ticker-dot { display: inline-block; width: 6px; height: 6px; background: var(--ink); border-radius: 50%; margin-right: 40px; vertical-align: middle; }

  /* ── Hero ── */
  .hero {
    position: relative; z-index: 1;
    padding: 72px 40px 80px;
    text-align: center;
    max-width: 900px; margin: 0 auto;
    animation: fadeUp 0.8s ease both;
  }
  .hero-eyebrow {
    font-size: 0.72rem; letter-spacing: 4px; text-transform: uppercase;
    color: var(--amber); font-weight: 500; margin-bottom: 16px;
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(3rem, 7vw, 6rem);
    line-height: 1.0; font-weight: 900;
    color: var(--ink); margin-bottom: 20px;
  }
  .hero-title em { font-style: italic; color: var(--amber); }
  .hero-subtitle {
    font-size: 1.1rem; color: var(--ink-light); max-width: 520px;
    margin: 0 auto; line-height: 1.6; font-weight: 300;
  }

  /* ── Card ── */
  .card {
    background: var(--white);
    border-radius: 4px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(200, 135, 58, 0.15);
  }

  /* ── Form ── */
  .form-card {
    max-width: 780px; margin: 0 auto 64px;
    padding: 48px 52px;
    position: relative; z-index: 1;
    animation: fadeUp 0.9s 0.1s ease both;
  }
  .form-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--amber), var(--teal));
    border-radius: 4px 4px 0 0;
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-group.full { grid-column: 1 / -1; }
  .input-shell {
    position: relative;
  }
  .form-label {
    font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase;
    font-weight: 500; color: var(--ink-light);
  }
  .form-input {
    padding: 14px 18px;
    background: var(--sand);
    border: 1.5px solid var(--sand-dark);
    border-radius: 3px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem; color: var(--ink);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .form-input:focus {
    border-color: var(--amber);
    box-shadow: 0 0 0 3px rgba(200,135,58,0.12);
    background: var(--white);
  }
  .form-input::placeholder { color: rgba(26,21,16,0.35); }
  .form-helper {
    font-size: 0.78rem;
    color: rgba(61,52,40,0.72);
  }
  .suggestion-list {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    background: var(--white);
    border: 1px solid rgba(200, 135, 58, 0.2);
    border-radius: 12px;
    box-shadow: var(--shadow);
  }
  .suggestion-item {
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .suggestion-item:hover,
  .suggestion-item:focus-visible {
    background: var(--amber-pale);
    color: var(--ink);
    outline: none;
  }
  .interest-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6px;
  }
  .interest-chip {
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(200, 135, 58, 0.22);
    background: var(--white);
    color: var(--ink-light);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .interest-chip:hover,
  .interest-chip:focus-visible {
    border-color: var(--amber);
    color: var(--ink);
    transform: translateY(-1px);
    outline: none;
  }
  .interest-chip.active {
    background: var(--amber-pale);
    border-color: var(--amber);
    color: var(--ink);
  }
  .form-arrow {
    display: flex; align-items: center; justify-content: center;
    padding-top: 28px; font-size: 1.4rem; color: var(--amber);
  }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px 36px;
    border: none; border-radius: 3px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; font-weight: 500; letter-spacing: 1px;
    text-transform: uppercase; cursor: pointer;
    transition: all 0.25s ease;
  }
  .btn-primary {
    background: var(--ink); color: var(--amber-light);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--ink-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(26,21,16,0.25);
  }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary {
    background: transparent; color: var(--ink);
    border: 1.5px solid var(--ink);
  }
  .btn-secondary:hover:not(:disabled) {
    background: var(--ink); color: var(--white);
    transform: translateY(-2px);
  }
  .btn-teal {
    background: var(--teal); color: white;
  }
  .btn-teal:hover:not(:disabled) {
    background: var(--teal-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,110,110,0.3);
  }
  .btn-teal:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-footer { margin-top: 32px; display: flex; justify-content: flex-end; }

  /* ── Loading ── */
  .loading-wrap {
    display: flex; flex-direction: column; align-items: center;
    gap: 20px; padding: 80px 40px; z-index: 1; position: relative;
    animation: fadeUp 0.5s ease;
  }
  .spinner {
    width: 48px; height: 48px;
    border: 3px solid var(--sand-dark);
    border-top-color: var(--amber);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .loading-text {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem; font-style: italic;
    color: var(--ink-light);
  }

  /* ── Highlights Section ── */
  .section {
    max-width: 1100px; margin: 0 auto;
    padding: 0 40px 80px;
    position: relative; z-index: 1;
  }
  .section-header {
    display: flex; align-items: baseline; gap: 16px;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1.5px solid var(--sand-dark);
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem; font-weight: 900;
    color: var(--ink);
  }
  .section-subtitle { font-size: 0.85rem; color: var(--ink-light); font-weight: 300; }

  .route-badge {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--ink); color: var(--amber-light);
    padding: 8px 20px; border-radius: 2px;
    font-size: 0.8rem; letter-spacing: 1px; font-weight: 500;
    margin-bottom: 32px;
  }
  .route-badge span { color: rgba(255,255,255,0.5); }

  /* Highlights prose */
  .highlights-card {
    padding: 40px 44px;
    animation: fadeUp 0.6s ease both;
    line-height: 1.9; font-size: 0.97rem; color: var(--ink-light);
    white-space: pre-wrap;
  }
  .highlights-card strong, .highlights-card b { color: var(--ink); }

  /* ── Options Grid ── */
  .priority-section { margin-bottom: 40px; }
  .priority-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
  }
  .priority-badge {
    padding: 4px 14px; border-radius: 2px;
    font-size: 0.68rem; letter-spacing: 2px; font-weight: 500; text-transform: uppercase;
  }
  .priority-badge.high   { background: #c0392b; color: white; }
  .priority-badge.mid    { background: var(--amber); color: var(--ink); }
  .priority-badge.low    { background: var(--teal); color: white; }
  .priority-count { font-size: 0.8rem; color: var(--ink-light); font-weight: 300; }

  .places-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .place-card {
    padding: 20px 22px;
    cursor: pointer;
    transition: all 0.25s ease;
    border: 1.5px solid transparent;
    position: relative;
    overflow: hidden;
  }
  .place-card::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: var(--amber);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  .place-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
  .place-card:hover::after { transform: scaleX(1); }
  .place-card.selected {
    border-color: var(--amber);
    background: var(--amber-pale);
    box-shadow: 0 0 0 3px rgba(200,135,58,0.15);
  }
  .place-card.selected::after { transform: scaleX(1); }
  .place-check {
    position: absolute; top: 14px; right: 14px;
    width: 22px; height: 22px; border-radius: 50%;
    border: 1.5px solid var(--sand-dark);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem;
    transition: all 0.2s;
    background: white;
  }
  .place-card.selected .place-check {
    background: var(--amber); border-color: var(--amber); color: white;
  }
  .place-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem; font-weight: 700;
    color: var(--ink); margin-bottom: 6px; padding-right: 30px;
  }
  .place-desc {
    font-size: 0.82rem; color: var(--ink-light); line-height: 1.55;
    margin-bottom: 12px; font-weight: 300;
  }
  .place-meta {
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .place-tag {
    font-size: 0.67rem; letter-spacing: 1px; text-transform: uppercase;
    padding: 3px 9px; border-radius: 2px;
    background: var(--sand-dark); color: var(--ink-light);
  }
  .place-time {
    font-size: 0.67rem; letter-spacing: 1px; text-transform: uppercase;
    padding: 3px 9px; border-radius: 2px;
    background: var(--ink); color: var(--amber-light);
  }

  /* Selection bar */
  .selection-bar {
    position: fixed;
    left: 24px;
    right: 24px;
    bottom: 16px;
    z-index: 120;
    background: rgba(26, 21, 16, 0.94);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 12px 20px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 20px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.28);
    animation: fadeUp 0.4s ease;
  }
  .selection-bar-left { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  .selection-summary { display: flex; align-items: baseline; gap: 10px; }
  .selection-count {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 900;
    color: var(--amber-light); line-height: 1;
  }
  .selection-label { font-size: 0.84rem; color: rgba(255,255,255,0.68); }
  .days-picker {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border-radius: 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .days-label-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 82px;
  }
  .days-label {
    font-size: 0.65rem; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(255,255,255,0.5);
  }
  .days-hint {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.72);
  }
  .days-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .days-stepper {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: white;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
  }
  .days-stepper:hover:not(:disabled),
  .days-stepper:focus-visible {
    background: rgba(255,255,255,0.12);
    border-color: rgba(232,168,85,0.6);
    transform: translateY(-1px);
    outline: none;
  }
  .days-stepper:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .days-pills {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .days-pill {
    min-width: 40px;
    height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.84);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.86rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
  }
  .days-pill:hover,
  .days-pill:focus-visible {
    background: rgba(255,255,255,0.12);
    border-color: rgba(232,168,85,0.5);
    color: white;
    transform: translateY(-1px);
    outline: none;
  }
  .days-pill.active {
    background: var(--amber-light);
    border-color: var(--amber-light);
    color: var(--ink);
  }

  /* ── Itinerary ── */
  .itinerary-shell {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .itinerary-hero {
    padding: 30px 32px;
    background:
      radial-gradient(circle at top right, rgba(232,168,85,0.2), transparent 35%),
      linear-gradient(135deg, rgba(26,21,16,0.98), rgba(45,110,110,0.9));
    color: white;
    border: none;
    overflow: hidden;
  }
  .itinerary-eyebrow {
    font-size: 0.7rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    margin-bottom: 14px;
  }
  .itinerary-hero-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 24px;
  }
  .itinerary-hero .section-title {
    color: white;
    margin-bottom: 10px;
  }
  .itinerary-hero-text {
    max-width: 620px;
    font-size: 0.96rem;
    line-height: 1.7;
    color: rgba(255,255,255,0.75);
  }
  .itinerary-route {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 16px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 0.9rem;
    white-space: nowrap;
  }
  .itinerary-route strong {
    color: var(--amber-pale);
    font-weight: 700;
  }
  .itinerary-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  .itinerary-summary-card {
    padding: 16px 18px;
    border-radius: 16px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .itinerary-summary-label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.68rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
  }
  .itinerary-summary-value {
    display: block;
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    line-height: 1;
    color: white;
    margin-bottom: 6px;
  }
  .itinerary-summary-copy {
    font-size: 0.82rem;
    line-height: 1.5;
    color: rgba(255,255,255,0.68);
  }
  .itinerary-days {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .day-card {
    overflow: hidden;
    border-radius: 24px;
    border: 1px solid rgba(200, 135, 58, 0.18);
    box-shadow: 0 18px 40px rgba(26,21,16,0.1);
    animation: fadeUp 0.5s ease both;
  }
  .day-header {
    padding: 24px 28px 18px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    background: linear-gradient(180deg, rgba(253,250,246,0.9), rgba(253,250,246,0.98));
    border-bottom: 1px solid rgba(200, 135, 58, 0.12);
  }
  .day-identity {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    min-width: 0;
  }
  .day-badge {
    min-width: 78px;
    padding: 12px 10px;
    border-radius: 18px;
    background: var(--ink);
    text-align: center;
  }
  .day-number {
    font-family: 'Playfair Display', serif;
    font-size: 2.4rem; font-weight: 900; color: var(--amber-light);
    line-height: 1;
  }
  .day-number-label {
    margin-top: 6px;
    font-size: 0.65rem; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4);
  }
  .day-heading {
    min-width: 0;
    padding-top: 4px;
  }
  .day-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .day-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: var(--ink);
  }
  .day-stop-count,
  .day-meta-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 500;
    letter-spacing: 0.4px;
  }
  .day-stop-count {
    background: rgba(232,168,85,0.16);
    color: #9c6420;
  }
  .day-places-preview {
    font-size: 0.92rem;
    color: var(--ink-light);
    line-height: 1.6;
  }
  .day-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }
  .day-meta-pill {
    background: rgba(45,110,110,0.1);
    color: var(--teal);
  }
  .day-place-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 0 28px 18px;
  }
  .day-place-pill {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(26,21,16,0.05);
    border: 1px solid rgba(26,21,16,0.08);
    font-size: 0.82rem;
    color: var(--ink);
  }
  .day-body { padding: 0 28px 28px; }
  .day-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .day-panel {
    background: rgba(245,239,230,0.7);
    border: 1px solid rgba(200, 135, 58, 0.12);
    border-radius: 18px;
    padding: 18px 18px 14px;
  }

  .day-section-title {
    font-size: 0.65rem; letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--amber); font-weight: 500; margin-bottom: 12px;
  }
  .time-slot {
    display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px dashed rgba(26,21,16,0.08);
  }
  .time-slot:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
  .time-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--amber); margin-top: 7px; flex-shrink: 0;
    box-shadow: 0 0 0 6px rgba(200,135,58,0.12);
    animation: pulse-dot 2s ease infinite;
  }
  .time-text { font-size: 0.88rem; color: var(--ink-light); line-height: 1.5; }

  .transport-item {
    display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px dashed rgba(26,21,16,0.08);
  }
  .transport-item:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
  .transport-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 10px;
    background: rgba(45,110,110,0.1);
    font-size: 1rem;
    margin-top: 1px;
  }
  .transport-text { font-size: 0.88rem; color: var(--ink-light); line-height: 1.5; }
  .day-empty {
    font-size: 0.85rem;
    line-height: 1.6;
    color: rgba(61,52,40,0.72);
  }

  .day-notes {
    grid-column: 1 / -1;
    display: flex;
    gap: 14px;
    align-items: flex-start;
    background: linear-gradient(90deg, rgba(253,243,227,0.95), rgba(255,250,244,0.95));
    border: 1px solid rgba(200,135,58,0.2);
    padding: 16px 18px;
    border-radius: 18px;
    font-size: 0.87rem; color: var(--ink-light);
  }
  .day-notes-badge {
    flex-shrink: 0;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(200,135,58,0.14);
    color: #9c6420;
    font-size: 0.72rem;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    font-weight: 600;
  }

  /* ── Step Divider ── */
  .step-divider {
    max-width: 1100px; margin: 0 auto 48px;
    padding: 0 40px;
    display: flex; align-items: center; gap: 20px;
    position: relative; z-index: 1;
  }
  .step-divider-line { flex: 1; height: 1px; background: var(--sand-dark); }
  .step-divider-label {
    font-size: 0.68rem; letter-spacing: 3px; text-transform: uppercase;
    color: var(--ink-light); font-weight: 500;
  }

  /* ── Error ── */
  .error-toast {
    position: fixed; top: 80px; right: 24px; z-index: 999;
    background: #c0392b; color: white;
    padding: 14px 20px; border-radius: 3px;
    font-size: 0.88rem; max-width: 360px;
    box-shadow: var(--shadow-lg);
    animation: fadeUp 0.3s ease;
  }

  /* ── Additional utility classes ── */
  .form-card-wrapper {
    margin: 0 auto 64px;
    max-width: 780px;
    position: relative;
    z-index: 1;
  }

  .form-card-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--amber), var(--teal));
    border-radius: 4px 4px 0 0;
  }

  .section-no-bottom-pad {
    padding-bottom: 0 !important;
  }

  .section-highlights {
    padding-bottom: 40px;
  }

  /* ── Two-column layout for highlights + options ── */
  .highlights-options-container {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 40px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    position: relative;
    z-index: 1;
  }

  .highlights-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .highlights-column .section-header {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .highlights-column .section-title {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }

  .highlights-column .section-subtitle {
    font-size: 0.78rem;
  }

  .highlights-card {
    overflow-y: auto;
  }

  .options-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .options-column .section-header {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .options-column .section-title {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }

  .options-column .section-subtitle {
    font-size: 0.78rem;
  }

  .options-sections-wrapper {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  @media (max-width: 1024px) {
    .highlights-options-container {
      grid-template-columns: 1fr;
      gap: 32px;
      padding: 0 24px;
    }
    .itinerary-hero-main {
      flex-direction: column;
    }
    .itinerary-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .day-header {
      flex-direction: column;
    }
    .day-meta {
      justify-content: flex-start;
    }
  }

  .route-badge-destination {
    color: var(--amber-light);
  }

  .route-badge-interests {
    color: rgba(255, 255, 255, 0.6);
    text-transform: capitalize;
  }

  .button-actions {
    display: flex;
    gap: 12px;
  }

  .btn-secondary-custom {
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.6);
  }

  .selection-bar-empty {
    position: fixed;
    left: 24px;
    right: 24px;
    bottom: 16px;
    z-index: 120;
    background: rgba(26, 21, 16, 0.88);
    backdrop-filter: blur(8px);
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 12px 20px;
    text-align: center;
    box-shadow: 0 14px 36px rgba(0,0,0,0.22);
  }

  .selection-bar-empty-text {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.82rem;
    letter-spacing: 1px;
  }

  .section-itinerary {
    padding-top: 48px;
    max-width: 1240px;
  }

  .itinerary-actions {
    display: flex;
    gap: 16px;
    margin-top: 40px;
    justify-content: space-between;
  }

  .footer-main {
    background: var(--ink);
    color: rgba(255, 255, 255, 0.3);
    padding: 32px 40px;
    text-align: center;
    font-size: 0.75rem;
    letter-spacing: 1px;
    position: relative;
    z-index: 1;
  }

  /* ── Responsive ── */
  @media (max-width: 680px) {
    .form-grid { grid-template-columns: 1fr; }
    .form-arrow { display: none; }
    .form-card { padding: 32px 24px; }
    .hero { padding: 48px 24px 56px; }
    .section { padding: 0 24px 60px; }
    .day-grid { grid-template-columns: 1fr; }
    .header { padding: 0 20px; }
    .itinerary-hero { padding: 24px 20px; }
    .itinerary-summary-grid { grid-template-columns: 1fr; }
    .itinerary-route {
      width: 100%;
      justify-content: center;
      white-space: normal;
    }
    .day-header,
    .day-body,
    .day-place-strip {
      padding-left: 20px;
      padding-right: 20px;
    }
    .day-identity {
      flex-direction: column;
      width: 100%;
    }
    .day-badge {
      min-width: 72px;
    }
    .itinerary-actions {
      flex-direction: column;
    }
    .app-selection-mode { padding-bottom: 188px; }
    .selection-bar,
    .selection-bar-empty {
      left: 12px;
      right: 12px;
      bottom: 12px;
    }
    .selection-bar {
      padding: 12px 14px;
      align-items: stretch;
      flex-direction: column;
      gap: 14px;
    }
    .selection-bar-left {
      align-items: stretch;
      gap: 12px;
    }
    .selection-summary {
      justify-content: space-between;
    }
    .days-picker {
      width: 100%;
      align-items: flex-start;
      flex-direction: column;
    }
    .days-label-group {
      min-width: auto;
    }
    .days-controls,
    .days-pills,
    .button-actions {
      width: 100%;
    }
    .button-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
`;

// ── Inject styles ───────────────────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);

// ── Helpers ────────────────────────────────────────────────────────────────
const STEP_LABELS = ["Plan", "Discover", "Select", "Itinerary"];
const DAY_OPTIONS = [1, 2, 3, 5, 7];
const CITY_SUGGESTIONS = [
  "Agra",
  "Ahmedabad",
  "Amritsar",
  "Bangalore",
  "Bhopal",
  "Chandigarh",
  "Chennai",
  "Darjeeling",
  "Delhi",
  "Goa",
  "Hyderabad",
  "Jaipur",
  "Kochi",
  "Kolkata",
  "Leh",
  "Lucknow",
  "Manali",
  "Mumbai",
  "Munnar",
  "Mysore",
  "Ooty",
  "Pondicherry",
  "Pune",
  "Rishikesh",
  "Shimla",
  "Srinagar",
  "Udaipur",
  "Varanasi",
];
const INTEREST_SUGGESTIONS = [
  "history",
  "food",
  "nature",
  "temples",
  "adventure",
  "shopping",
  "nightlife",
  "art",
  "architecture",
  "beaches",
  "wildlife",
  "trekking",
  "photography",
  "wellness",
  "local culture",
];
const clampDays = (value: number) => Math.min(30, Math.max(1, value));
const getMatchingSuggestions = (query: string, options: string[], limit = 6) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return options.slice(0, limit);
  return options.filter(option => option.toLowerCase().includes(normalizedQuery)).slice(0, limit);
};
const parseInterests = (value: string) =>
  value
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);
const getCurrentInterestQuery = (value: string) => value.split(",").pop()?.trim() || "";
const replaceInterestQuery = (value: string, suggestion: string) => {
  const segments = value.split(",");
  if (segments.length <= 1) return suggestion;

  const committed = segments
    .slice(0, -1)
    .map(part => part.trim())
    .filter(Boolean);

  if (committed.some(part => part.toLowerCase() === suggestion.toLowerCase())) {
    return committed.join(", ");
  }

  return [...committed, suggestion].join(", ");
};

const TickerTape = () => {
  const items = ["Discover", "Explore", "Adventure", "Wander", "Journey", "Experience", "Travel", "Explore"];
  return (
    <div className="ticker">
      <div className="ticker-inner">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

const Spinner = ({ text = "Crafting your journey…" }) => (
  <div className="loading-wrap">
    <div className="spinner" />
    <p className="loading-text">{text}</p>
  </div>
);

const getTransportIcon = (text = "") => {
  const t = text.toLowerCase();
  if (t.includes("walk")) return "🚶";
  if (t.includes("train") || t.includes("metro")) return "🚆";
  if (t.includes("bus")) return "🚌";
  if (t.includes("taxi") || t.includes("cab")) return "🚕";
  if (t.includes("auto")) return "🛺";
  if (t.includes("flight") || t.includes("air")) return "✈️";
  if (t.includes("boat") || t.includes("ferry")) return "⛴️";
  return "🚗";
};

// ── Main App ────────────────────────────────────────────────────────────────
export default function TourGuide() {
  const [step, setStep] = useState<number>(0); // 0=form, 1=loading, 2=highlights+options, 3=itinerary

  const [form, setForm] = useState({ from_location: "", to_location: "", interests: "" });
  const [highlights, setHighlights] = useState<string | null>(null);
  const [options, setOptions] = useState<any>(null);
  const [selected, setSelected] = useState(new Set<string>());
  const [numDays, setNumDays] = useState<number>(3);
  const [itinerary, setItinerary] = useState<any>(null);
  const [openSuggestions, setOpenSuggestions] = useState<"from" | "to" | "interests" | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>("Crafting your journey…");
  const [error, setError] = useState<string | null>(null);

  const itineraryRef = useRef<HTMLDivElement>(null);
  const activeInterestList = parseInterests(form.interests);
  const fromSuggestions = getMatchingSuggestions(form.from_location, CITY_SUGGESTIONS);
  const toSuggestions = getMatchingSuggestions(form.to_location, CITY_SUGGESTIONS);
  const interestSuggestions = getMatchingSuggestions(getCurrentInterestQuery(form.interests), INTEREST_SUGGESTIONS, 8);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleExplore = async () => {
    if (!form.from_location.trim() || !form.to_location.trim()) {
      setError("Please fill in both From and To locations.");
      return;
    }
    setStep(1);
    setLoadingMsg("Scouting the finest experiences for you…");

    try {
      const [tourRes, optRes] = await Promise.all([
        fetch(`${API}/tour`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, interests: form.interests || "general sightseeing" }),
        }),
        fetch(`${API}/tour/options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, interests: form.interests || "general sightseeing" }),
        }),
      ]);

      if (!tourRes.ok || !optRes.ok) throw new Error("API error");

      const tourData = await tourRes.json();
      const optData = await optRes.json();

      setHighlights(tourData.suggestions);
      setOptions(optData);
      setSelected(new Set());
      setStep(2);
    } catch (e) {
      setError("Could not connect to the tour API. Is the backend running?");
      setStep(0);
    }
  };

  const togglePlace = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleItinerary = async () => {
    if (selected.size === 0) { setError("Select at least one place."); return; }
    setLoadingMsg("Mapping your perfect itinerary…");
    setStep(1);
    try {
      const res = await fetch(`${API}/tour/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_location: form.from_location,
          to_location: form.to_location,
          num_days: numDays,
          selected_places: [...selected],
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setItinerary(data);
      setStep(3);
      setTimeout(() => itineraryRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError("Could not generate itinerary. Please try again.");
      setStep(2);
    }
  };

  const restart = () => {
    setStep(0); setHighlights(null); setOptions(null);
    setItinerary(null); setSelected(new Set());
  };
  const updateNumDays = (value: number) => setNumDays(clampDays(value));
  const applyInterestSuggestion = (suggestion: string) => {
    setForm(prev => ({ ...prev, interests: replaceInterestQuery(prev.interests, suggestion) }));
    setOpenSuggestions("interests");
  };
  const toggleInterestChip = (suggestion: string) => {
    setForm(prev => {
      const interests = parseInterests(prev.interests);
      const exists = interests.some(item => item.toLowerCase() === suggestion.toLowerCase());
      const next = exists
        ? interests.filter(item => item.toLowerCase() !== suggestion.toLowerCase())
        : [...interests, suggestion];
      return { ...prev, interests: next.join(", ") };
    });
  };

  const stepIndex = step === 0 ? 0 : step === 1 ? 0 : step === 2 ? 1 : 3;
  const dayPlans = itinerary?.day_plans || [];
  const itineraryPlaceCount = dayPlans.reduce((places: Set<string>, day: any) => {
    (day.places || []).forEach((place: string) => places.add(place));
    return places;
  }, new Set<string>()).size;
  const itineraryTransportCount = dayPlans.reduce((count: number, day: any) => count + (day.transport_details?.length || 0), 0);
  const itineraryNotesCount = dayPlans.reduce((count: number, day: any) => count + (day.notes ? 1 : 0), 0);
  const backToSelection = () => {
    setStep(2);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  return (
    <div className={`app ${step === 2 ? "app-selection-mode" : ""}`}>
      {/* Header */}
      <header className="header">
        <div className="header-logo">Voyage<span>AI</span></div>
        <div className="header-steps">
          {STEP_LABELS.map((l, i) => (
            <span key={l} className={`step-pill ${i < stepIndex ? "done" : i === stepIndex ? "active" : "todo"}`}>
              {i < stepIndex ? "✓ " : ""}{l}
            </span>
          ))}
        </div>
      </header>

      <TickerTape />

      {/* Error */}
      {error && <div className="error-toast">⚠ {error}</div>}

      {/* ── Step 0: Form ── */}
      {(step === 0 || step === 1) && (
        <>
          <div className="hero">
            <p className="hero-eyebrow">AI-Powered Travel Planning</p>
            <h1 className="hero-title">Your next great<br /><em>adventure</em> awaits</h1>
            <p className="hero-subtitle">
              Tell us where you're headed and what excites you —
              we'll craft a personalised journey worth remembering.
            </p>
          </div>

          <div className="form-card card form-card-wrapper">
            <div className="form-card-border" />
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Departing From</label>
                <div className="input-shell">
                  <input
                    className="form-input"
                    placeholder="e.g. Bangalore"
                    value={form.from_location}
                    onFocus={() => setOpenSuggestions("from")}
                    onBlur={() => setOpenSuggestions(null)}
                    onChange={e => {
                      setForm(f => ({ ...f, from_location: e.target.value }));
                      setOpenSuggestions("from");
                    }}
                    onKeyDown={e => e.key === "Enter" && handleExplore()}
                  />
                  {openSuggestions === "from" && fromSuggestions.length > 0 && (
                    <div className="suggestion-list">
                      {fromSuggestions.map(city => (
                        <button
                          key={city}
                          type="button"
                          className="suggestion-item"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setForm(f => ({ ...f, from_location: city }));
                            setOpenSuggestions(null);
                          }}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-arrow">→</div>
              <div className="form-group">
                <label className="form-label">Destination</label>
                <div className="input-shell">
                  <input
                    className="form-input"
                    placeholder="e.g. Mysore"
                    value={form.to_location}
                    onFocus={() => setOpenSuggestions("to")}
                    onBlur={() => setOpenSuggestions(null)}
                    onChange={e => {
                      setForm(f => ({ ...f, to_location: e.target.value }));
                      setOpenSuggestions("to");
                    }}
                    onKeyDown={e => e.key === "Enter" && handleExplore()}
                  />
                  {openSuggestions === "to" && toSuggestions.length > 0 && (
                    <div className="suggestion-list">
                      {toSuggestions.map(city => (
                        <button
                          key={city}
                          type="button"
                          className="suggestion-item"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setForm(f => ({ ...f, to_location: city }));
                            setOpenSuggestions(null);
                          }}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group full">
                <label className="form-label">Your Interests</label>
                <div className="input-shell">
                  <input
                    className="form-input"
                  placeholder="e.g. history, food, nature, temples, adventure sports…"
                   value={form.interests}
                   onFocus={() => setOpenSuggestions("interests")}
                   onBlur={() => setOpenSuggestions(null)}
                   onChange={e => {
                     setForm(f => ({ ...f, interests: e.target.value }));
                     setOpenSuggestions("interests");
                   }}
                  onKeyDown={e => e.key === "Enter" && handleExplore()}
                />
                  {openSuggestions === "interests" && interestSuggestions.length > 0 && (
                    <div className="suggestion-list">
                      {interestSuggestions.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          className="suggestion-item"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => applyInterestSuggestion(interest)}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
                <span className="form-helper">Type anything, or tap a suggested interest to add it.</span>
                <div className="interest-chip-row">
                  {INTEREST_SUGGESTIONS.slice(0, 8).map(interest => {
                    const isActive = activeInterestList.some(item => item.toLowerCase() === interest.toLowerCase());
                    return (
                      <button
                        key={interest}
                        type="button"
                        className={`interest-chip ${isActive ? "active" : ""}`}
                        onClick={() => toggleInterestChip(interest)}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="form-footer">
              <button className="btn btn-primary" onClick={handleExplore} disabled={step === 1}>
                {step === 1 ? "Exploring…" : "Explore Destinations →"}
              </button>
            </div>
          </div>

          {step === 1 && <Spinner text={loadingMsg} />}
        </>
      )}

      {/* ── Step 2: Highlights + Options ── */}
      {step === 2 && options && (
        <>
          {/* Route badge */}
          <div className="section section-no-bottom-pad">
            <div className="route-badge">
              <span>{form.from_location}</span>
              <span>→</span>
              <span className="route-badge-destination">{form.to_location}</span>
              {form.interests && <><span>·</span><span className="route-badge-interests">{form.interests}</span></>}
            </div>
          </div>

          {/* Two-column layout: Highlights Left + Options Right */}
          <div className="highlights-options-container">
            {/* Left: Highlights */}
            {highlights && (
              <div className="highlights-column">
                <div className="section-header">
                  <h2 className="section-title">Highlights</h2>
                  <span className="section-subtitle">A curated overview of your journey</span>
                </div>
                <div className="card highlights-card">{highlights}</div>
              </div>
            )}

            {/* Right: Place Options */}
            <div className="options-column">
              <div className="section-header">
                <h2 className="section-title">Select Places</h2>
                <span className="section-subtitle">Tap to add to your itinerary</span>
              </div>

              <div className="options-sections-wrapper">
                {[
                  { key: "high_priority", label: "High Priority", cls: "high" },
                  { key: "mid_priority", label: "Mid Priority", cls: "mid" },
                  { key: "low_priority", label: "Low Priority", cls: "low" },
                ].map(({ key, label, cls }) => {
                  const places = options[key] || [];
                  if (!places.length) return null;
                  return (
                    <div className="priority-section" key={key}>
                      <div className="priority-header">
                        <span className={`priority-badge ${cls}`}>{label}</span>
                        <span className="priority-count">{places.length} places</span>
                      </div>
                      <div className="places-grid">
                        {places.map((place: any) => {
                          const isSel = selected.has(place.name);
                          return (
                            <div
                              key={place.name}
                              className={`place-card card ${isSel ? "selected" : ""}`}
                              onClick={() => togglePlace(place.name)}
                              style={{ animationDelay: `${Math.random() * 0.3}s` }}
                            >
                              <div className="place-check">{isSel ? "✓" : ""}</div>
                              <div className="place-name">{place.name}</div>
                              <div className="place-desc">{place.description}</div>
                              <div className="place-meta">
                                {place.category && <span className="place-tag">{place.category}</span>}
                                {place.estimated_time && <span className="place-time">⏱ {place.estimated_time}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky selection bar */}
          {selected.size > 0 && (
            <div className="selection-bar">
              <div className="selection-bar-left">
                <div className="selection-summary">
                  <div className="selection-count">{selected.size}</div>
                  <div className="selection-label">place{selected.size !== 1 ? "s" : ""} selected</div>
                </div>
                <div className="days-picker">
                  <div className="days-label-group">
                    <span className="days-label">Trip length</span>
                    <span className="days-hint">{numDays} day{numDays !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="days-controls">
                    <button
                      type="button"
                      className="days-stepper"
                      aria-label="Decrease days"
                      onClick={() => updateNumDays(numDays - 1)}
                      disabled={numDays <= 1}
                    >
                      -
                    </button>
                    <div className="days-pills">
                      {DAY_OPTIONS.map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`days-pill ${numDays === day ? "active" : ""}`}
                          onClick={() => updateNumDays(day)}
                        >
                          {day}d
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="days-stepper"
                      aria-label="Increase days"
                      onClick={() => updateNumDays(numDays + 1)}
                      disabled={numDays >= 30}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="button-actions">
                <button className="btn btn-secondary btn-secondary-custom" onClick={restart}>
                  Start Over
                </button>
                <button className="btn btn-teal" onClick={handleItinerary}>
                  Generate Itinerary →
                </button>
              </div>
            </div>
          )}

          {selected.size === 0 && (
            <div className="selection-bar-empty">
              <span className="selection-bar-empty-text">
                ← Select places above to build your itinerary →
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Step 3: Itinerary ── */}
      {step === 3 && itinerary && (
        <div ref={itineraryRef}>
          <section className="section section-itinerary">
            <div className="itinerary-shell">
              <div className="card itinerary-hero">
                <div className="itinerary-eyebrow">Ready to explore</div>
                <div className="itinerary-hero-main">
                  <div>
                    <h2 className="section-title">Your Itinerary</h2>
                    <p className="itinerary-hero-text">
                      A cleaner day-by-day plan with stops, timing, and transport notes so you can scan the whole trip quickly.
                    </p>
                  </div>
                  <div className="itinerary-route">
                    <span>{itinerary.from_location}</span>
                    <span>{"->"}</span>
                    <strong>{itinerary.to_location}</strong>
                  </div>
                </div>
                <div className="itinerary-summary-grid">
                  <div className="itinerary-summary-card">
                    <span className="itinerary-summary-label">Duration</span>
                    <span className="itinerary-summary-value">{itinerary.num_days}</span>
                    <span className="itinerary-summary-copy">days planned</span>
                  </div>
                  <div className="itinerary-summary-card">
                    <span className="itinerary-summary-label">Stops</span>
                    <span className="itinerary-summary-value">{itineraryPlaceCount}</span>
                    <span className="itinerary-summary-copy">unique places across the trip</span>
                  </div>
                  <div className="itinerary-summary-card">
                    <span className="itinerary-summary-label">Transfers</span>
                    <span className="itinerary-summary-value">{itineraryTransportCount}</span>
                    <span className="itinerary-summary-copy">movement notes included</span>
                  </div>
                  <div className="itinerary-summary-card">
                    <span className="itinerary-summary-label">Tips</span>
                    <span className="itinerary-summary-value">{itineraryNotesCount}</span>
                    <span className="itinerary-summary-copy">days with planning notes</span>
                  </div>
                </div>
              </div>

              <div className="itinerary-days">
              <span className="section-subtitle">{itinerary.num_days}-day journey · {itinerary.from_location} → {itinerary.to_location}</span>
                {dayPlans.map((day: any, i: number) => (
              <div className="day-card card" key={day.day} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="day-header">
                  <div className="day-identity">
                    <div className="day-badge">
                    <div className="day-number">{String(day.day).padStart(2, "0")}</div>
                    <div className="day-number-label">Day</div>
                    </div>
                    <div className="day-heading">
                      <div className="day-title-row">
                        <h3 className="day-title">Day {day.day}</h3>
                        <span className="day-stop-count">{(day.places || []).length} stop{(day.places || []).length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="day-places-preview">
                    {(day.places || []).join("  ·  ")}
                      </div>
                    </div>
                  </div>
                  <div className="day-meta">
                    <span className="day-meta-pill">{day.timing?.length || 0} schedule item{(day.timing?.length || 0) !== 1 ? "s" : ""}</span>
                    <span className="day-meta-pill">{day.transport_details?.length || 0} transfer{(day.transport_details?.length || 0) !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div className="day-body">
                  <div className="day-grid">
                    {/* Timing */}
                    {day.timing?.length > 0 && (
                      <div className="day-panel">
                        <div className="day-section-title">Schedule</div>
                        {day.timing.map((t: any, j: number) => (
                          <div className="time-slot" key={j}>
                            <div className="time-dot" style={{ animationDelay: `${j * 0.4}s` }} />
                            <div className="time-text">{t}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Transport */}
                    {day.transport_details?.length > 0 && (
                      <div className="day-panel">
                        <div className="day-section-title">Getting Around</div>
                        {day.transport_details.map((t: any, j: number) => (
                          <div className="transport-item" key={j}>
                            <span className="transport-icon">{getTransportIcon(t)}</span>
                            <div className="transport-text">{t}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Notes */}
                    {day.notes && (
                      <div className="day-notes">
                        💡 {day.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
              </div>

            <div className="itinerary-actions">
              <button className="btn btn-secondary" onClick={backToSelection}>
                ← Back to Selection
              </button>
              <button className="btn btn-primary" onClick={restart}>
                Plan Another Trip
              </button>
            </div>
            </div>
          </section>
        </div>
      )}

      {/* Footer */}
      <footer className="footer-main">
        VOYAGE AI — Intelligent Travel Planning &nbsp;·&nbsp; Powered by LLM
      </footer>
    </div>
  );
}
