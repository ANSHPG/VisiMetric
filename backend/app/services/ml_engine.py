def predict_quality(features: dict) -> dict:
    score = 85.0
    label = "ACCEPTABLE"
    issues = []
    
    if features.get("laplacian_variance", 0) < 100:
        score -= 30
        label = "DEGRADED"
        issues.append({"type": "blur", "severity": "HIGH", "confidence": 0.88})
        
    if features.get("mean_luminance", 0) < 50:
        score -= 20
        label = "DEGRADED"
        issues.append({"type": "underexposure", "severity": "MEDIUM", "confidence": 0.75})
        
    if score < 40:
        label = "DEFECTIVE"
        
    return {
        "quality_score": score,
        "quality_label": label,
        "issues": issues
    }
