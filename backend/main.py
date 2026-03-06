from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
from groq import Groq
from dotenv import load_dotenv
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# ─── Config ────────────────────────────────────────────────
DATABASE_URL = f"sqlite:///{(BASE_DIR / 'tour.db').as_posix()}"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("Please set GROQ_API_KEY in .env file")

# ─── Database ──────────────────────────────────────────────
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Tour(Base):
    __tablename__ = "tours"
    id = Column(Integer, primary_key=True, index=True)
    from_location = Column(String(100), nullable=False)
    to_location = Column(String(100), nullable=False)
    interests = Column(String(200), nullable=False)
    suggestions = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TourOption(Base):
    __tablename__ = "tour_options"
    id = Column(Integer, primary_key=True, index=True)
    from_location = Column(String(100), nullable=False)
    to_location = Column(String(100), nullable=False)
    options_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TourItinerary(Base):
    __tablename__ = "tour_itineraries"
    id = Column(Integer, primary_key=True, index=True)
    from_location = Column(String(100), nullable=False)
    to_location = Column(String(100), nullable=False)
    num_days = Column(Integer, nullable=False)
    selected_places = Column(Text, nullable=False)
    itinerary_plan = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

# ─── LLM Client ────────────────────────────────────────────
client = Groq(api_key=GROQ_API_KEY)

# ─── FastAPI ───────────────────────────────────────────────
app = FastAPI(title="Tour Guide Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Models ───────────────────────────────────────
class TourRequest(BaseModel):
    from_location: str
    to_location: str
    interests: str = "general sightseeing"

class TourResponse(BaseModel):
    id: int
    from_location: str
    to_location: str
    interests: str
    suggestions: str
    created_at: datetime.datetime

class OptionPlace(BaseModel):
    name: str
    description: str
    priority: str  # "Low", "Mid", "High"
    category: str
    estimated_time: str

class TourOptionsResponse(BaseModel):
    id: int
    from_location: str
    to_location: str
    low_priority: list[OptionPlace]
    mid_priority: list[OptionPlace]
    high_priority: list[OptionPlace]
    created_at: datetime.datetime

class ItineraryRequest(BaseModel):
    from_location: str
    to_location: str
    num_days: int
    selected_places: list[str]  # List of place names selected by user

class DayPlan(BaseModel):
    day: int
    places: list[str]
    transport_details: list[str]
    timing: list[str]
    notes: str

class ItineraryResponse(BaseModel):
    id: int
    from_location: str
    to_location: str
    num_days: int
    day_plans: list[DayPlan]
    created_at: datetime.datetime

# ─── Tour Guide Endpoint ───────────────────────────────
@app.post("/tour", response_model=TourResponse)
def tour_guide(request: TourRequest):
    """Tour guide endpoint that suggests places to visit between two locations"""
    if not request.from_location.strip() or not request.to_location.strip():
        raise HTTPException(400, "From and To locations cannot be empty")

    try:
        # Create the tour guide prompt
        prompt = f"""You are an expert tour guide. A traveler is planning a trip from {request.from_location} to {request.to_location} and is interested in {request.interests}.

Provide detailed travel recommendations including:
1. Must-see attractions and landmarks
2. Local restaurants and cuisine recommendations
3. Outdoor activities and nature spots
4. Cultural sites and museums
5. Best time to visit
6. Travel tips and local customs
7. Budget-friendly and luxury options

Make recommendations specific, helpful, and encouraging. and make it readable write 2 lines for each type in point wise format."""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=2048,
        )

        suggestions = completion.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(500, f"Error generating tour suggestions: {str(e)}")

    # Save tour to database
    db = SessionLocal()
    try:
        tour = Tour(
            from_location=request.from_location,
            to_location=request.to_location,
            interests=request.interests,
            suggestions=suggestions
        )
        db.add(tour)
        db.commit()
        db.refresh(tour)
        return tour
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Database error: {str(e)}")
    finally:
        db.close()

# ─── Tour Options Endpoint (Top 20 Places) ─────────────────
@app.post("/tour/options")
def generate_tour_options(request: TourRequest):
    """Generate top 20 places categorized by priority (Low, Mid, High)"""
    if not request.from_location.strip() or not request.to_location.strip():
        raise HTTPException(400, "From and To locations cannot be empty")

    try:
        prompt = f"""You are an expert tour guide. Generate exactly 20 must-visit places for a trip from {request.to_location} with interest in {request.interests}.

Return the response in this EXACT JSON format:
{{
  "low_priority": [
    {{
      "name": "Place Name",
      "description": "Brief description",
      "category": "Category type",
      "estimated_time": "2-3 hours"
    }}
  ],
  "mid_priority": [
    {{
      "name": "Place Name",
      "description": "Brief description",
      "category": "Category type",
      "estimated_time": "3-4 hours"
    }}
  ],
  "high_priority": [
    {{
      "name": "Place Name",
      "description": "Brief description",
      "category": "Category type",
      "estimated_time": "4-5 hours"
    }}
  ]
}}

Distribute places: 5-6 Low priority, 6-7 Mid priority, 6-7 High priority. Return ONLY the JSON object, no extra text."""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=3000,
        )

        response_text = completion.choices[0].message.content.strip()
        
        # Parse JSON response
        import json
        try:
            options_data = json.loads(response_text)
        except json.JSONDecodeError:
            raise HTTPException(500, "Failed to parse LLM response")

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(500, f"Error generating options: {str(e)}")

    # Save to database
    db = SessionLocal()
    try:
        tour_option = TourOption(
            from_location=request.from_location,
            to_location=request.to_location,
            options_json=response_text
        )
        db.add(tour_option)
        db.commit()
        db.refresh(tour_option)
        
        return {
            "id": tour_option.id,
            "from_location": request.from_location,
            "to_location": request.to_location,
            "low_priority": options_data.get("low_priority", []),
            "mid_priority": options_data.get("mid_priority", []),
            "high_priority": options_data.get("high_priority", []),
            "created_at": tour_option.created_at
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Database error: {str(e)}")
    finally:
        db.close()

# ─── Tour Itinerary Endpoint (Day-by-Day Plan) ─────────────
@app.post("/tour/itinerary")
def create_tour_itinerary(request: ItineraryRequest):
    """Create a detailed day-by-day itinerary with transport and timing"""
    if not request.from_location.strip() or not request.to_location.strip():
        raise HTTPException(400, "From and To locations cannot be empty")
    
    if request.num_days < 1:
        raise HTTPException(400, "Number of days must be at least 1")
    
    if not request.selected_places:
        raise HTTPException(400, "At least one place must be selected")

    try:
        places_str = ", ".join(request.selected_places)
        
        prompt = f"""You are an expert travel planner. Create a detailed {request.num_days}-day itinerary for a trip from {request.from_location} to {request.to_location}.

Selected places to visit: {places_str}

Return the response in this EXACT JSON format:
{{
  "itinerary": [
    {{
      "day": 1,
      "places": ["Place 1", "Place 2"],
      "transport_details": ["Auto/Taxi from Place1 to Place2 (15 min)"],
      "timing": ["9:00 AM - 11:00 AM at Place1", "11:30 AM - 1:30 PM at Place2"],
      "notes": "Start early, have breakfast before heading out"
    }},
    {{
      "day": 2,
      "places": ["Place 3"],
      "transport_details": ["Bus from hotel to Place3 (30 min)"],
      "timing": ["10:00 AM - 3:00 PM at Place3"],
      "notes": "Plan lunch at a local restaurant near Place3"
    }}
  ]
}}

Ensure:
- Distribute selected places evenly across {request.num_days} days
- Include realistic transport modes (Auto, Bus, Taxi, Walking, Train)
- Add estimated travel times between places
- Include timing for each activity
- Add helpful notes for each day
- Consider opening hours and travel distances

Return ONLY the JSON object, no extra text."""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=4000,
        )

        response_text = completion.choices[0].message.content.strip()
        
        # Parse JSON response
        import json
        try:
            itinerary_data = json.loads(response_text)
        except json.JSONDecodeError:
            raise HTTPException(500, "Failed to parse LLM response")

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(500, f"Error generating itinerary: {str(e)}")

    # Save to database
    db = SessionLocal()
    try:
        tour_itinerary = TourItinerary(
            from_location=request.from_location,
            to_location=request.to_location,
            num_days=request.num_days,
            selected_places=", ".join(request.selected_places),
            itinerary_plan=response_text
        )
        db.add(tour_itinerary)
        db.commit()
        db.refresh(tour_itinerary)
        
        return {
            "id": tour_itinerary.id,
            "from_location": request.from_location,
            "to_location": request.to_location,
            "num_days": request.num_days,
            "day_plans": itinerary_data.get("itinerary", []),
            "created_at": tour_itinerary.created_at
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Database error: {str(e)}")
    finally:
        db.close()


# ─── Tour History Endpoints ────────────────────────────────
@app.get("/tour-history", response_model=list[TourResponse])
def get_tour_history():
    """Get all previous tour recommendations"""
    db = SessionLocal()
    try:
        tours = (
            db.query(Tour)
            .order_by(Tour.created_at.desc())
            .limit(50)
            .all()
        )
        return tours
    finally:
        db.close()

@app.get("/tour/{tour_id}", response_model=TourResponse)
def get_tour(tour_id: int):
    """Get a specific tour recommendation"""
    db = SessionLocal()
    try:
        tour = db.query(Tour).filter(Tour.id == tour_id).first()
        if not tour:
            raise HTTPException(404, "Tour not found")
        return tour
    finally:
        db.close()

@app.get("/tour/options/{option_id}")
def get_tour_options(option_id: int):
    """Get saved tour options by ID"""
    db = SessionLocal()
    try:
        import json
        tour_option = db.query(TourOption).filter(TourOption.id == option_id).first()
        if not tour_option:
            raise HTTPException(404, "Tour options not found")
        
        options_data = json.loads(tour_option.options_json)
        return {
            "id": tour_option.id,
            "from_location": tour_option.from_location,
            "to_location": tour_option.to_location,
            "options": options_data,
            "created_at": tour_option.created_at
        }
    finally:
        db.close()

@app.get("/tour/itinerary/{itinerary_id}")
def get_tour_itinerary(itinerary_id: int):
    """Get saved tour itinerary by ID"""
    db = SessionLocal()
    try:
        import json
        itinerary = db.query(TourItinerary).filter(TourItinerary.id == itinerary_id).first()
        if not itinerary:
            raise HTTPException(404, "Tour itinerary not found")
        
        itinerary_data = json.loads(itinerary.itinerary_plan)
        return {
            "id": itinerary.id,
            "from_location": itinerary.from_location,
            "to_location": itinerary.to_location,
            "num_days": itinerary.num_days,
            "selected_places": itinerary.selected_places,
            "itinerary": itinerary_data,
            "created_at": itinerary.created_at
        }
    finally:
        db.close()
