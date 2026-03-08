import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTransportIcon } from '../services/utils';
import {
  clearLastItinerary,
  downloadItineraryDocument,
  loadLastItinerary,
  type SavedItinerary,
} from '../services/history';

export default function HistoryPage() {
  const [savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(() => loadLastItinerary());

  useEffect(() => {
    const syncHistory = () => setSavedItinerary(loadLastItinerary());
    window.addEventListener('storage', syncHistory);
    return () => window.removeEventListener('storage', syncHistory);
  }, []);

  const handleClear = () => {
    clearLastItinerary();
    setSavedItinerary(null);
  };

  return (
    <div className="app">
      <header className="header print-hide">
        <Link to="/" className="header-logo header-logo-link">
          Voyage<span>AI</span>
        </Link>
        <div className="header-actions">
          <Link to="/" className="header-action-link">
            Plan Trip
          </Link>
        </div>
      </header>

      <div className="print-hide">
        <div className="ticker">
          <div className="ticker-inner">
            {[...Array(2)].flatMap((_, loopIndex) =>
              ['Saved', 'Local', 'Private', 'Printable'].map((item, index) => (
                <span key={`${loopIndex}-${item}-${index}`} className="ticker-item">
                  <span className="ticker-dot" />
                  {item}
                </span>
              )),
            )}
          </div>
        </div>
      </div>

      <section className="section history-page">
        <div className="history-shell">
          <div className="history-top card">
            <span className="history-eyebrow">Saved itinerary</span>
            <h1 className="history-title">History</h1>
            <p className="history-copy">
              This page shows only the latest itinerary saved in this browser. It is not stored in the backend or any database.
            </p>
            <div className="history-disclaimer">
              <strong>Storage note</strong>
              <span>Only local storage is used, so clearing browser data or switching devices will remove it.</span>
            </div>
          </div>

          {!savedItinerary && (
            <div className="history-empty card">
              <h2 className="section-title">No saved itinerary yet</h2>
              <p className="history-copy">
                Generate an itinerary first. The latest one will appear here automatically and stay only in local storage.
              </p>
              <Link to="/" className="btn btn-primary">
                Start Planning
              </Link>
            </div>
          )}

          {savedItinerary && (
            <>
              <div className="history-toolbar print-hide">
                <div className="history-toolbar-copy">
                  <span className="history-toolbar-label">Last saved</span>
                  <strong>{new Date(savedItinerary.saved_at).toLocaleString()}</strong>
                </div>
                <div className="history-toolbar-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
                    Print
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => downloadItineraryDocument(savedItinerary)}
                  >
                    Download
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleClear}>
                    Clear Saved
                  </button>
                </div>
              </div>

              <div className="history-note-card card">
                <span className="history-note-badge">Local only</span>
                <p>
                  This itinerary is saved only in your browser local storage. It is not written to the backend or any database.
                </p>
              </div>

              <section className="section section-itinerary section-history-itinerary">
                <div className="itinerary-shell">
                  <div className="card itinerary-hero">
                    <div className="itinerary-eyebrow">Recovered from this browser</div>
                    <div className="itinerary-hero-main">
                      <div>
                        <h2 className="section-title">Latest Saved Itinerary</h2>
                        <p className="itinerary-hero-text">
                          Use print or download to keep a copy elsewhere, because this page does not read from a database.
                        </p>
                      </div>
                      <div className="itinerary-route">
                        <span>{savedItinerary.from_location}</span>
                        <span>{"->"}</span>
                        <strong>{savedItinerary.to_location}</strong>
                      </div>
                    </div>
                    <div className="itinerary-summary-grid">
                      <div className="itinerary-summary-card">
                        <span className="itinerary-summary-label">Duration</span>
                        <span className="itinerary-summary-value">{savedItinerary.num_days}</span>
                        <span className="itinerary-summary-copy">days planned</span>
                      </div>
                      <div className="itinerary-summary-card">
                        <span className="itinerary-summary-label">Places</span>
                        <span className="itinerary-summary-value">{savedItinerary.selected_places.length}</span>
                        <span className="itinerary-summary-copy">selected by you</span>
                      </div>
                      <div className="itinerary-summary-card">
                        <span className="itinerary-summary-label">Interests</span>
                        <span className="itinerary-summary-value">{savedItinerary.interests ? savedItinerary.interests.split(',').length : 1}</span>
                        <span className="itinerary-summary-copy">interest tags</span>
                      </div>
                      <div className="itinerary-summary-card">
                        <span className="itinerary-summary-label">Saved</span>
                        <span className="itinerary-summary-value">
                          {new Date(savedItinerary.saved_at).toLocaleDateString()}
                        </span>
                        <span className="itinerary-summary-copy">in this browser only</span>
                      </div>
                    </div>
                  </div>

                  <div className="history-selected-places card">
                    <div className="day-section-title">Selected places</div>
                    <div className="history-chip-row">
                      {savedItinerary.selected_places.map((place) => (
                        <span key={place} className="day-place-pill">
                          {place}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="itinerary-days">
                    <span className="section-subtitle">
                      {savedItinerary.num_days}-day journey · {savedItinerary.from_location} → {savedItinerary.to_location}
                    </span>
                    {savedItinerary.day_plans.map((day, index) => (
                      <div className="day-card card" key={day.day} style={{ animationDelay: `${index * 0.08}s` }}>
                        <div className="day-header">
                          <div className="day-identity">
                            <div className="day-badge">
                              <div className="day-number">{String(day.day).padStart(2, '0')}</div>
                              <div className="day-number-label">Day</div>
                            </div>
                            <div className="day-heading">
                              <div className="day-title-row">
                                <h3 className="day-title">Day {day.day}</h3>
                                <span className="day-stop-count">
                                  {(day.places || []).length} stop{(day.places || []).length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="day-places-preview">{(day.places || []).join(' · ')}</div>
                            </div>
                          </div>
                          <div className="day-meta">
                            <span className="day-meta-pill">
                              {day.timing?.length || 0} schedule item{(day.timing?.length || 0) !== 1 ? 's' : ''}
                            </span>
                            <span className="day-meta-pill">
                              {day.transport_details?.length || 0} transfer{(day.transport_details?.length || 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="day-body">
                          <div className="day-grid">
                            {day.timing?.length > 0 && (
                              <div className="day-panel">
                                <div className="day-section-title">Schedule</div>
                                {day.timing.map((item, timingIndex) => (
                                  <div className="time-slot" key={`${day.day}-timing-${timingIndex}`}>
                                    <div className="time-dot" />
                                    <div className="time-text">{item}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {day.transport_details?.length > 0 && (
                              <div className="day-panel">
                                <div className="day-section-title">Getting Around</div>
                                {day.transport_details.map((item, transportIndex) => (
                                  <div className="transport-item" key={`${day.day}-transport-${transportIndex}`}>
                                    <span className="transport-icon">{getTransportIcon(item)}</span>
                                    <div className="transport-text">{item}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {day.notes && (
                              <div className="day-notes">
                                <span className="day-notes-badge">Note</span>
                                <span>{day.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </section>

      <footer className="footer-main print-hide">
        VOYAGE AI · Latest itinerary history stored only in local storage
      </footer>
    </div>
  );
}
