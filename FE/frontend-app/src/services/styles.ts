// ── Styles ─────────────────────────────────────────────────────────────────
export const styles = `
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
    max-width: 980px; margin: 0 auto 72px;
    padding: 34px;
    position: relative; z-index: 1;
    animation: fadeUp 0.9s 0.1s ease both;
    border-radius: 28px;
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(45,110,110,0.09), transparent 26%),
      radial-gradient(circle at bottom left, rgba(200,135,58,0.1), transparent 24%),
      linear-gradient(180deg, rgba(253,250,246,0.98), rgba(251,245,236,0.96));
    box-shadow: 0 24px 60px rgba(49, 34, 20, 0.14);
    border: 1px solid rgba(200, 135, 58, 0.2);
  }
  .form-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, var(--amber), var(--teal));
  }
  .form-card::after {
    content: 'Trip brief';
    position: absolute;
    top: 20px;
    right: 24px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,0.68);
    border: 1px solid rgba(200, 135, 58, 0.16);
    color: rgba(61,52,40,0.78);
    font-size: 0.68rem;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .form-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 84px minmax(0, 1fr);
    gap: 22px;
    align-items: end;
  }
  .form-group {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 22px;
    border-radius: 22px;
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(200, 135, 58, 0.14);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
  }
  .form-grid > .form-group:nth-child(1)::before,
  .form-grid > .form-group:nth-child(3)::before,
  .form-group.full::before {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(26,21,16,0.06);
    border: 1px solid rgba(26,21,16,0.08);
    color: rgba(26,21,16,0.56);
    font-size: 0.7rem;
    letter-spacing: 1px;
  }
  .form-grid > .form-group:nth-child(1)::before { content: '01'; }
  .form-grid > .form-group:nth-child(3)::before { content: '02'; }
  .form-group.full::before { content: '03'; }
  .form-group.full {
    grid-column: 1 / -1;
    margin-top: 2px;
    padding-top: 24px;
    background: linear-gradient(180deg, rgba(255,255,255,0.78), rgba(253,243,227,0.66));
  }
  .input-shell {
    position: relative;
  }
  .form-label {
    font-size: 0.72rem; letter-spacing: 2.4px; text-transform: uppercase;
    font-weight: 600; color: rgba(61,52,40,0.76);
  }
  .form-input {
    width: 100%;
    min-height: 58px;
    padding: 16px 18px;
    background: rgba(255,255,255,0.88);
    border: 1.5px solid rgba(200, 135, 58, 0.14);
    border-radius: 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem; color: var(--ink);
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s, background 0.2s;
    outline: none;
    box-shadow: inset 0 1px 2px rgba(26,21,16,0.04);
  }
  .form-input:hover {
    border-color: rgba(200, 135, 58, 0.28);
    background: rgba(255,255,255,0.96);
  }
  .form-input:focus {
    border-color: var(--amber);
    box-shadow: 0 0 0 4px rgba(200,135,58,0.12);
    background: var(--white);
    transform: translateY(-1px);
  }
  .form-input::placeholder { color: rgba(26,21,16,0.35); }
  .form-helper {
    font-size: 0.82rem;
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
    margin-top: 4px;
  }
  .interest-chip {
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(200, 135, 58, 0.22);
    background: rgba(255,255,255,0.78);
    color: var(--ink-light);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
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
    width: 84px;
    height: 84px;
    display: flex; align-items: center; justify-content: center;
    align-self: center;
    border-radius: 999px;
    font-size: 1.6rem;
    color: var(--amber);
    background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(253,243,227,0.92));
    border: 1px solid rgba(200, 135, 58, 0.16);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.72),
      0 16px 30px rgba(49, 34, 20, 0.08);
    position: relative;
  }
  .form-arrow::before,
  .form-arrow::after {
    content: '';
    position: absolute;
    width: 34px;
    height: 1px;
    background: rgba(200, 135, 58, 0.34);
  }
  .form-arrow::before { left: -26px; }
  .form-arrow::after { right: -26px; }
  .form-arrow span {
    display: none;
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
  .form-footer {
    margin-top: 28px;
    padding-top: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    border-top: 1px solid rgba(200, 135, 58, 0.14);
  }
  .form-footer::before {
    content: 'Recommendations, top places, and a day-by-day itinerary in one flow.';
    max-width: 420px;
    color: rgba(61,52,40,0.72);
    font-size: 0.84rem;
    line-height: 1.6;
  }

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
    .form-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .form-card {
      padding: 28px 20px;
      border-radius: 24px;
    }
    .form-card::after {
      position: static;
      display: inline-flex;
      margin-bottom: 18px;
    }
    .form-group {
      padding: 18px;
    }
    .form-group.full {
      padding-top: 20px;
    }
    .form-arrow {
      width: 100%;
      height: 52px;
      font-size: 1.2rem;
    }
    .form-arrow::before,
    .form-arrow::after {
      width: 24%;
    }
    .form-footer {
      flex-direction: column;
      align-items: stretch;
    }
    .form-footer::before {
      max-width: none;
    }
    .form-footer .btn {
      width: 100%;
    }
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
