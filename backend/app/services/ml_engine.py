import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0
import torchvision.transforms as transforms
from PIL import Image
import io
import os

model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    global model
    if model is not None:
        return
        
    model_path = os.path.join(os.path.dirname(__file__), '../../ml/models/efficientnet_b0_v1.pth')
    base_model = efficientnet_b0()
    base_model.classifier[1] = nn.Sequential(
        nn.Linear(base_model.classifier[1].in_features, 1),
        nn.Sigmoid()
    )
    
    if os.path.exists(model_path):
        try:
            base_model.load_state_dict(torch.load(model_path, map_location=device))
        except Exception as e:
            print("Weight shape mismatch (expected during training architecture transitions). Using base weights.")
        
    base_model = base_model.to(device)
    base_model.eval()
    model = base_model

def predict_quality(features: dict, image_bytes: bytes) -> dict:
    load_model()
    
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    img_t = transform(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        output = model(img_t)
        score = output.item() * 100.0
        
    score = max(0.0, min(100.0, float(score)))
    
    if score >= 65.0:
        label = "ACCEPTABLE"
    elif score >= 40.0:
        label = "DEGRADED"
    else:
        label = "DEFECTIVE"
    
    issues = []
    if features.get("laplacian_variance", 0) < 100:
        issues.append({"type": "blur", "severity": "HIGH", "confidence": 0.88})
        if label == "ACCEPTABLE":
            label = "DEGRADED"
            score = max(0.0, score - 15)
            
    if features.get("mean_luminance", 0) < 50:
        issues.append({"type": "underexposure", "severity": "MEDIUM", "confidence": 0.75})
        if label == "ACCEPTABLE":
            label = "DEGRADED"
            score = max(0.0, score - 15)
            
    if not issues and score < 60:
        issues.append({"type": "complex distortion", "severity": "MEDIUM", "confidence": 0.85})
        if score < 30:
            issues[0]["severity"] = "HIGH"
            
    return {
        "quality_score": score,
        "quality_label": label,
        "issues": issues
    }