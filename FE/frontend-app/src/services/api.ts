import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Types ────────────────────────────────────────────────

export interface TourRequest {
  from_location: string;
  to_location: string;
  interests?: string;
}

export interface OptionPlace {
  name: string;
  description: string;
  priority?: string;
  category: string;
  estimated_time: string;
}

export interface TourResponse {
  from_location: string;
  to_location: string;
  interests: string;
  suggestions: string;
  created_at: string;
}

export interface TourOptionsResponse {
  from_location: string;
  to_location: string;
  low_priority: OptionPlace[];
  mid_priority: OptionPlace[];
  high_priority: OptionPlace[];
  created_at: string;
}

export interface DayPlan {
  day: number;
  places: string[];
  transport_details: string[];
  timing: string[];
  notes: string;
}

export interface ItineraryRequest {
  from_location: string;
  to_location: string;
  num_days: number;
  selected_places: string[];
}

export interface ItineraryResponse {
  from_location: string;
  to_location: string;
  num_days: number;
  day_plans: DayPlan[];
  created_at: string;
}

// ─── API Endpoints ────────────────────────────────────────

export const tourAPI = {
  // Get tour recommendations
  getTourRecommendations: async (request: TourRequest): Promise<TourResponse> => {
    const response = await api.post<TourResponse>('/tour', request);
    return response.data;
  },

  // Get tour options (top 20 places)
  getTourOptions: async (request: TourRequest): Promise<TourOptionsResponse> => {
    const response = await api.post<TourOptionsResponse>('/tour/options', request);
    return response.data;
  },

  // Create tour itinerary
  createItinerary: async (request: ItineraryRequest): Promise<ItineraryResponse> => {
    const response = await api.post<ItineraryResponse>('/tour/itinerary', request);
    return response.data;
  },

};

export default api;
