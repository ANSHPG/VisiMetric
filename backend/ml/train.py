import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, ConcatDataset
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
        scaled_dmos = (dmos - 1.0) / 4.0
        label = torch.tensor([scaled_dmos], dtype=torch.float32)
        if self.transform:
            image = self.transform(image)
        return image, label

class KonIQDataset(Dataset):
    def __init__(self, csv_file, img_dir, transform=None):
        self.data = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        img_name = os.path.join(self.img_dir, self.data.iloc[idx, 0])
        image = Image.open(img_name).convert('RGB')
        mos = float(self.data.iloc[idx, 7])
        label = torch.tensor([mos / 100.0], dtype=torch.float32)
        if self.transform:
            image = self.transform(image)
        return image, label

def train_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    base_dir = os.path.dirname(__file__)
    datasets = []
    kadid_csv = os.path.join(base_dir, 'kadid10k/image_labeled_by_per_noise.csv')
    kadid_img = os.path.join(base_dir, 'kadid10k/images/')
    if os.path.exists(kadid_csv):
        datasets.append(KADIDDataset(csv_file=kadid_csv, img_dir=kadid_img, transform=transform))
    koniq_csv = os.path.join(base_dir, 'KonIQ-10k/koniq10k_distributions_sets.csv')
    koniq_img = os.path.join(base_dir, 'KonIQ-10k/512x384/')
    if os.path.exists(koniq_csv):
        datasets.append(KonIQDataset(csv_file=koniq_csv, img_dir=koniq_img, transform=transform))
    if not datasets:
        print("No datasets found.")
        return
    from torch.utils.data import Subset
    
    # Take a small subset from each dataset for rapid convergence demo
    sub_datasets = []
    for d in datasets:
        sub_datasets.append(Subset(d, list(range(250))))
        
    combined_dataset = ConcatDataset(sub_datasets)
    dataloader = DataLoader(combined_dataset, batch_size=32, shuffle=True)
    print(f"Total training images (FAST DEMO MODE): {len(combined_dataset)}")
    model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
    model.classifier[1] = nn.Sequential(
        nn.Linear(model.classifier[1].in_features, 1),
        nn.Sigmoid()
    )
    model = model.to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    epochs = 1
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for i, (inputs, labels) in enumerate(dataloader):
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
            if i % 10 == 0:
                print(f"Batch {i}/{len(dataloader)} Loss: {loss.item():.4f}")
        print(f"Epoch {epoch+1}/{epochs} Loss: {running_loss/len(dataloader):.4f}")
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    save_path = os.path.join(models_dir, 'efficientnet_b0_v1.pth')
    torch.save(model.state_dict(), save_path)
    print(f"Model saved to {save_path}")

if __name__ == '__main__':
    train_model()