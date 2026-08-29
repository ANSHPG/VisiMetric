import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0

print("Building model...")
base_model = efficientnet_b0()
base_model.classifier[1] = nn.Linear(base_model.classifier[1].in_features, 1)

print("Loading weights...")
try:
    base_model.load_state_dict(torch.load('backend/ml/models/efficientnet_b0_v1.pth', map_location='cpu'))
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
