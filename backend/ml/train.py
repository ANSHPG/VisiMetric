import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
import pandas as pd
from PIL import Image
import os

class KADIDDataset(Dataset):
    def __init__(self, csv_file, img_dir, transform=None):
        self.data = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        img_name = os.path.join(self.img_dir, self.data.iloc[idx, 0])
        image = Image.open(img_name).convert('RGB')
        dmos = float(self.data.iloc[idx, 1])
        
        if dmos >= 70:
            label = 0
        elif dmos >= 40:
            label = 1
        else:
            label = 2
            
        if self.transform:
            image = self.transform(image)
            
        return image, label

def train_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    try:
        dataset = KADIDDataset(csv_file='kadid10k/dmos.csv', img_dir='kadid10k/images/', transform=transform)
        dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
    except Exception as e:
        print("Dataset not found. Please download KADID-10k and extract to backend/ml/kadid10k/")
        return
        
    model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 3)
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    epochs = 10
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            
        print(f"Epoch {epoch+1}/{epochs} Loss: {running_loss/len(dataloader)}")
        
    os.makedirs('models', exist_ok=True)
    torch.save(model.state_dict(), 'models/efficientnet_b0_v1.pth')
    print("Training complete. Model saved to models/efficientnet_b0_v1.pth")

if __name__ == '__main__':
    train_model()
