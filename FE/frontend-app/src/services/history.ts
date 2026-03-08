import type { ItineraryResponse } from './api';

export interface SavedItinerary extends ItineraryResponse {
  interests: string;
  selected_places: string[];
  saved_at: string;
}

const LAST_ITINERARY_KEY = 'voyageai:last-itinerary';

export function saveLastItinerary(itinerary: SavedItinerary): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LAST_ITINERARY_KEY, JSON.stringify(itinerary));
}

export function loadLastItinerary(): SavedItinerary | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(LAST_ITINERARY_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SavedItinerary;
  } catch {
    window.localStorage.removeItem(LAST_ITINERARY_KEY);
    return null;
  }
}

export function clearLastItinerary(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LAST_ITINERARY_KEY);
}

export function buildItineraryDocument(itinerary: SavedItinerary): string {
  const lines: string[] = [
    'VoyageAI Saved Itinerary',
    '',
    `Route: ${itinerary.from_location} -> ${itinerary.to_location}`,
    `Interests: ${itinerary.interests || 'general sightseeing'}`,
    `Duration: ${itinerary.num_days} day${itinerary.num_days === 1 ? '' : 's'}`,
    `Saved in browser: ${new Date(itinerary.saved_at).toLocaleString()}`,
    'Storage: Local storage only. Not saved in backend or database.',
    '',
    'Selected places:',
    ...itinerary.selected_places.map((place) => `- ${place}`),
    '',
    'Day-by-day plan:',
  ];

  itinerary.day_plans.forEach((day) => {
    lines.push('');
    lines.push(`Day ${day.day}`);
    lines.push(`Places: ${(day.places || []).join(', ') || 'None listed'}`);

    if (day.timing?.length) {
      lines.push('Schedule:');
      day.timing.forEach((entry) => lines.push(`- ${entry}`));
    }

    if (day.transport_details?.length) {
      lines.push('Transport:');
      day.transport_details.forEach((entry) => lines.push(`- ${entry}`));
    }

    if (day.notes) {
      lines.push(`Notes: ${day.notes}`);
    }
  });

  return lines.join('\n');
}

export function downloadItineraryDocument(itinerary: SavedItinerary): void {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = new Blob([buildItineraryDocument(itinerary)], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  const from = itinerary.from_location.trim().replace(/\s+/g, '-').toLowerCase();
  const to = itinerary.to_location.trim().replace(/\s+/g, '-').toLowerCase();

  link.href = url;
  link.download = `voyageai-itinerary-${from}-to-${to}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
