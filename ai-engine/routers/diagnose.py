from fastapi import APIRouter, File, UploadFile, Form
from datetime import datetime
from PIL import Image
import io

router = APIRouter()

@router.post("/diagnose")
async def diagnose_crop(
    file: UploadFile = File(...),
    crop: str = Form(...),
    part: str = Form(...)
):
    # Read and resize image (mock preprocessing)
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents))
        img = img.resize((224, 224))
    except Exception as e:
        print(f"Image processing error: {e}")

    # Mock Inference logic based on crop and part
    result = {
        "disease": "Healthy",
        "confidence": 0.95,
        "severity": "None",
        "action": "No action needed. Continue regular care."
    }

    if part.lower() == "leaf":
        if crop.lower() == "sugarcane":
            result = {
                "disease": "Red Rot", 
                "confidence": 0.87, 
                "severity": "High", 
                "action": "Remove infected stalks immediately. Apply Carbendazim fungicide."
            }
        elif crop.lower() == "paddy":
            result = {
                "disease": "Leaf Blast", 
                "confidence": 0.79, 
                "severity": "Medium", 
                "action": "Spray Tricyclazole 75 WP at 0.6g/L. Drain fields for 3 days."
            }
        elif crop.lower() == "tomato":
            result = {
                "disease": "Early Blight", 
                "confidence": 0.91, 
                "severity": "Medium", 
                "action": "Apply Mancozeb + Copper Oxychloride spray. Remove infected leaves."
            }

    # Attach metadata
    response = {
        **result,
        "timestamp": datetime.now().isoformat(),
        "model_version": "v1.0-mock"
    }
    
    return response
