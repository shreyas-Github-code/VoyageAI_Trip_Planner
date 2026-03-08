import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clampDays, getCurrentInterestQuery, getMatchingSuggestions, getTransportIcon, parseInterests, replaceInterestQuery } from "../services/utils";
import type { ItineraryResponse } from "../services/api";
import { saveLastItinerary } from "../services/history";
import { styles } from "../services/styles";
import { CITY_SUGGESTIONS, DAY_OPTIONS, INTEREST_SUGGESTIONS, STEP_LABELS } from "../helpers/helpers";

const API = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

// ── Fonts ──────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

// ── Inject styles ───────────────────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);

export const TickerTape = () => {
    const items = ["Discover", "Explore", "Adventure", "Wander", "Journey", "Experience", "Travel", "Explore"];
    return (
        <div className= "ticker" >
            <div className="ticker-inner" >
                    {
                        [...items, ...items].map((t, i) => (
                            <span key= { i } className = "ticker-item" >
                            <span className="ticker-dot" />
                            { t }
                        </span>
                        ))
                    }
            </div>
        </div>
  );
};

export const Spinner = ({ text = "Crafting your journey…" }) => (
            <div className= "loading-wrap" >
                <div className="spinner" />
                    <p className="loading-text" > { text } </p>
            </div>
);

// ── Main App ────────────────────────────────────────────────────────────────
export default function TourGuide() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0); // 0=form, 1=loading, 2=highlights+options, 3=itinerary

  const [form, setForm] = useState({ from_location: "", to_location: "", interests: "" });
  const [highlights, setHighlights] = useState<string | null>(null);
  const [options, setOptions] = useState<any>(null);
  const [selected, setSelected] = useState(new Set<string>());
  const [numDays, setNumDays] = useState<number>(3);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [openSuggestions, setOpenSuggestions] = useState<"from" | "to" | "interests" | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>("Crafting your journey…");
  const [error, setError] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);
  const itineraryDaysRef = useRef<HTMLDivElement>(null);
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
    if (form.from_location.trim().toLowerCase() === form.to_location.trim().toLowerCase()) {
      setError("From and To locations cannot be the same city.");
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
    if (form.from_location.trim().toLowerCase() === form.to_location.trim().toLowerCase()) {
      setError("From and To locations cannot be the same city.");
      return;
    }
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
      const data: ItineraryResponse = await res.json();
      saveLastItinerary({
        ...data,
        interests: form.interests || "general sightseeing",
        selected_places: [...selected],
        saved_at: new Date().toISOString(),
      });
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

  const stepIndex = step === 3 ? 3 : step === 2 ? (selected.size > 0 ? 2 : 1) : 0;

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

  const scrollToSection = (target: HTMLDivElement | null) => {
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const canNavigateToStep = (index: number) => {
    if (step === 1) return false;
    if (index === 0) return true;
    if (index === 1) return Boolean(highlights);
    if (index === 2) return Boolean(options);
    if (index === 3) return Boolean(itinerary);
    return false;
  };

  const handleStepNavigation = (index: number) => {
    if (!canNavigateToStep(index)) return;

    if (index === 0) {
      setStep(0);
      setTimeout(() => scrollToSection(heroRef.current), 50);
      return;
    }

    if (index === 1) {
      setStep(2);
      setTimeout(() => scrollToSection(discoverRef.current), 80);
      return;
    }

    if (index === 2) {
      setStep(2);
      setTimeout(() => scrollToSection(selectRef.current), 80);
      return;
    }

    if (index === 3) {
      setStep(3);
      setTimeout(() => scrollToSection(itineraryRef.current), 80);
    }
  };

  return (
    <div className={`app ${step === 2 ? "app-selection-mode" : ""}`}>
      {/* Header */}
      <header className="header">
        <button type="button" className="header-logo header-logo-button" onClick={() => handleStepNavigation(0)}>
          Voyage<span>AI</span>
        </button>
        <div className="header-nav">
          <div className="header-steps">
            {STEP_LABELS.map((l, i) => (
              <button
                key={l}
                type="button"
                className={`step-pill ${i < stepIndex ? "done" : i === stepIndex ? "active" : "todo"} ${canNavigateToStep(i) ? "clickable" : "locked"}`}
                onClick={() => handleStepNavigation(i)}
                disabled={!canNavigateToStep(i)}
                aria-current={i === stepIndex ? "step" : undefined}
              >
                <span className="step-pill-index">{i < stepIndex ? "✓" : i + 1}</span>
                <span>{l}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="header-action-link" onClick={() => navigate("/history")}>
            Saved History
          </button>
        </div>
      </header>

      <TickerTape />

      {/* Error */}
      {error && <div className="error-toast">⚠ {error}</div>}

      {/* ── Step 0: Form ── */}
      {(step === 0 || step === 1) && (
        <>
          <div className="hero" ref={heroRef}>
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
          <div className="section section-no-bottom-pad" ref={discoverRef}>
            <div className="discover-topbar card">
              <div className="discover-topbar-copy">
                <span className="discover-topbar-label">Journey lens</span>
                <div className="route-badge">
                  <span className="route-badge-origin">{form.from_location}</span>
                  <span className="route-badge-arrow">→</span>
                  <span className="route-badge-destination">{form.to_location}</span>
                  {form.interests && (
                    <>
                      <span className="route-badge-separator">·</span>
                      <span className="route-badge-interests">{form.interests}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="section-nav section-nav-discover" role="navigation" aria-label="Discover sections">
                <button type="button" className="section-nav-btn active" onClick={() => scrollToSection(discoverRef.current)}>
                  Highlights
                </button>
                <button type="button" className="section-nav-btn" onClick={() => scrollToSection(selectRef.current)}>
                  Place Options
                </button>
                {itinerary && (
                  <button type="button" className="section-nav-btn" onClick={() => handleStepNavigation(3)}>
                    Itinerary
                  </button>
                )}
              </div>
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
            <div className="options-column" ref={selectRef}>
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

              <div className="section-nav section-nav-compact" role="navigation" aria-label="Itinerary sections">
                <button type="button" className="section-nav-btn active" onClick={() => scrollToSection(itineraryRef.current)}>
                  Overview
                </button>
                <button type="button" className="section-nav-btn" onClick={() => scrollToSection(itineraryDaysRef.current)}>
                  Day Plans
                </button>
                <button type="button" className="section-nav-btn" onClick={backToSelection}>
                  Back to Places
                </button>
              </div>

              <div className="history-note-card card">
                <span className="history-note-badge">Local only</span>
                <p>
                  The latest itinerary is saved only in this browser local storage. It is not stored in the backend or any database.
                </p>
              </div>

              <div className="itinerary-days" ref={itineraryDaysRef}>
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
              <button className="btn btn-secondary" onClick={() => navigate("/history")}>
                View Saved History
              </button>
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
