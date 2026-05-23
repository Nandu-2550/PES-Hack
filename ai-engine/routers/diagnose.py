from fastapi import APIRouter, File, UploadFile, Form
from datetime import datetime
from PIL import Image
import io

router = APIRouter()

# Comprehensive disease lookup — Tier 2 fallback
DISEASE_DB = {
  ("sugarcane", "leaf"): {
    "disease": "Red Rot", "confidence": 0.82, "severity": "High",
    "immediate_action": "Remove infected stalks immediately. Do not ratoon infected plots.",
    "chemical_treatment": "Carbendazim 50 WP — 2g/L water as foliar spray",
    "dose": "Soak seed setts in 0.1% Carbendazim for 30 minutes before planting",
    "organic_alternative": "Hot water treatment of setts at 52°C for 30 minutes",
    "prevention": "Use disease-free seed cane from certified sources",
    "yield_impact": "30-50% if untreated",
    "spread_risk": "High",
    "buyLinks": [{"name": "Katyayani Sugarcane Fungicides", "url": "https://katyayanikrishidirect.com/collections/fungicides-for-sugarcane-crop-protection"}]
  },
  ("sugarcane", "stem"): {
    "disease": "Wilt", "confidence": 0.78, "severity": "High",
    "immediate_action": "Improve field drainage immediately; remove severely wilted plants",
    "chemical_treatment": "Carbendazim 50 WP — 2g/L soil drench around root zone",
    "dose": "Apply 2L per plant at root zone; repeat after 15 days",
    "organic_alternative": "Trichoderma viride application to soil",
    "prevention": "Ensure proper drainage; avoid waterlogging",
    "yield_impact": "20-40% if untreated",
    "spread_risk": "Medium",
    "buyLinks": [{"name": "AgriBegri Fungicides", "url": "https://agribegri.com/crop-protection/fungicides"}]
  },
  ("paddy", "leaf"): {
    "disease": "Leaf Blast", "confidence": 0.84, "severity": "Medium",
    "immediate_action": "Stop nitrogen fertilization immediately; drain field for 3-5 days",
    "chemical_treatment": "Tricyclazole 75 WP — 0.6g per litre water",
    "dose": "Spray 500L per hectare; repeat after 10 days if needed",
    "organic_alternative": "Pseudomonas fluorescens 2.5 kg/ha in 500L water",
    "prevention": "Avoid excess nitrogen; use blast-resistant varieties (IR-64, Jaya)",
    "yield_impact": "10-30% if untreated",
    "spread_risk": "High",
    "buyLinks": [
      {"name": "Farmkart Paddy Blast Guide", "url": "https://farmkart.com/pages/best-fungicides-paddy-blast-india"},
      {"name": "Katyayani Bio Fungicides", "url": "https://katyayanikrishidirect.com/collections/control-blast-in-paddy-with-top-bio-fungicides"}
    ]
  },
  ("paddy", "stem"): {
    "disease": "Sheath Blight", "confidence": 0.80, "severity": "Medium",
    "immediate_action": "Spray Hexaconazole at tillering stage",
    "chemical_treatment": "Hexaconazole 5 EC — 2ml per litre water",
    "dose": "Spray at active tillering; apply to lower canopy region",
    "organic_alternative": "Trichoderma harzianum 2 kg/ha mixed with FYM",
    "prevention": "Reduce plant density; balanced fertilization",
    "yield_impact": "15-25% if untreated",
    "spread_risk": "Medium",
    "buyLinks": [{"name": "Dharmaj Crop Hexaconazole", "url": "https://www.dharmajcrop.com/products/fungicides/"}]
  },
  ("tomato", "leaf"): {
    "disease": "Early Blight", "confidence": 0.88, "severity": "Medium",
    "immediate_action": "Remove all infected lower leaves immediately; spray fungicide",
    "chemical_treatment": "Mancozeb 75 WP — 2.5g/L + Copper Oxychloride 3g/L mixed spray",
    "dose": "Spray every 7 days; start within 2 days of symptom notice",
    "organic_alternative": "Neem oil 5ml/L + baking soda 5g/L weekly spray",
    "prevention": "Stake plants for air circulation; drip irrigation only",
    "yield_impact": "20-40% if untreated",
    "spread_risk": "High",
    "buyLinks": [
      {"name": "Bayer Nativo for Tomato", "url": "https://www.bayercropscience.in/en/protect-crops/fungicides-en/nativo"},
      {"name": "AgriBegri Tomato Solutions", "url": "https://agribegri.com/crop-protection/fungicides"}
    ]
  },
  ("tomato", "stem"): {
    "disease": "Stem Canker (Bacterial)", "confidence": 0.76, "severity": "High",
    "immediate_action": "Remove infected plants; avoid wounding stems",
    "chemical_treatment": "Copper Oxychloride 50 WP 3g/L + Streptomycin 500ppm",
    "dose": "Drench stem base; repeat after 7 days",
    "organic_alternative": "Bordeaux mixture 1% spray on stem base",
    "prevention": "Use disease-free transplants; avoid mechanical injury",
    "yield_impact": "Total loss if plant wilts",
    "spread_risk": "Medium",
    "buyLinks": [{"name": "Agriplex Bactericides", "url": "https://agriplexindia.com/collections/fungicides-for-plants"}]
  },
}

def get_fallback_result(crop: str, part: str) -> dict:
  key = (crop.lower(), part.lower())
  if key in DISEASE_DB:
    return DISEASE_DB[key]
  # Generic fallback
  return {
    "disease": "General Stress / Unidentified Pathogen",
    "confidence": 0.60,
    "severity": "Moderate",
    "immediate_action": "Consult your local KVK or agricultural officer for field diagnosis",
    "chemical_treatment": "Mancozeb 75 WP — 2.5g/L as broad-spectrum protection",
    "dose": "Spray 2-3 times at 7-10 day intervals",
    "organic_alternative": "Neem oil 5ml/L spray every 14 days",
    "prevention": "Regular field scouting; proper nutrition management",
    "yield_impact": "Unknown — get field diagnosis",
    "spread_risk": "Medium",
    "buyLinks": [
      {"name": "AgriBegri — All Fungicides", "url": "https://agribegri.com/crop-protection/fungicides"},
      {"name": "Agriplex India", "url": "https://agriplexindia.com/collections/fungicides-for-plants"}
    ]
  }

@router.post("/diagnose")
async def diagnose_crop(
  file: UploadFile = File(...),
  crop: str = Form(...),
  part: str = Form(...)
):
  contents = await file.read()
  try:
    img = Image.open(io.BytesIO(contents)).resize((224, 224))
  except Exception as e:
    print(f"Image error: {e}")

  result = get_fallback_result(crop, part)
  return {
    **result,
    "timestamp": datetime.now().isoformat(),
    "model_version": "v2.0-rule-based",
    "runMode": "fastapi-rules"
  }
