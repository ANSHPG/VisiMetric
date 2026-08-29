import torch
import pandas as pd
from PIL import Image
import io
import os
from app.services.cv_pipeline import extract_features
from app.services.ml_engine import predict_quality

csv_path = 'ml/kadid10k/image_labeled_by_per_noise.csv'
img_dir = 'ml/kadid10k/images/'

df = pd.read_csv(csv_path)
sample = df.iloc[0]
img_name = sample['image']
dmos = sample['dmos']
actual_score = (dmos - 1.0) * 25.0

img_path = os.path.join(img_dir, img_name)
with open(img_path, 'rb') as f:
    img_bytes = f.read()

features = extract_features(img_bytes)
result = predict_quality(features, img_bytes)

print(f"Image: {img_name}")
print(f"Actual DMOS: {dmos} -> True Score: {actual_score}")
print(f"Predicted Quality Score: {result['quality_score']}")
print(f"Detected Issues: {result['issues']}")
print(f"Features: {features}")
