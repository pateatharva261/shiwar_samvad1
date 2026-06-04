# 🌾 Shiwar Samvad - AI-Powered Weed Detection & Herbicide Recommendation

> Precision agriculture platform using Vision Transformers, Real-ESRGAN, and Agentic AI for species-specific weed detection and intelligent herbicide recommendations.

## 🌟 Overview

AI-powered precision agriculture platform addressing herbicide overuse in farming. Uses Vision Transformers (ViT), Real-ESRGAN, and Generative AI to identify weed species, recommend targeted herbicides, calculate dosages, and estimate costs—promoting sustainable farming practices.

## ✨ Features

- **Weed Detection** - ViT model trained on DeepWeeds (9 classes, 17K+ images)
- **Image Enhancement** - Real-ESRGAN for blur correction
- **Smart Recommendations** - Species-specific herbicide suggestions
- **Dosage Calculator** - Area-based precise calculations
- **Cost Estimator** - Real-time treatment cost
- **AI Chatbot** - Groq-powered agricultural assistant
- **User Management** - JWT authentication & detection history

## 🛠️ Technology Stack

**Backend**: FastAPI • Python 3.8+ • MongoDB Atlas • PyTorch • Hugging Face Transformers • OpenCV • Real-ESRGAN • Groq API • JWT • Bcrypt

**Frontend**: React 19 • Vite • React Router • Tailwind CSS • Framer Motion • Axios • Context API

**AI Models**: Vision Transformer (ViT) • ResNet • Real-ESRGAN • GAN/Diffusion Models

## 📊 Model Performance

### Classification Accuracy (20% Validation Split)

| Model | Accuracy |
|-------|----------|
| **ViT (fine-tuned, proposed)** | **95.13%** |
| ResNet-50 (CNN baseline) | 89.78% |
| ANN on risk features (tabular) | 50.99% |

The fine-tuned Vision Transformer significantly outperforms the ResNet-50 baseline and traditional ANN approaches, demonstrating the effectiveness of transformer-based architectures for weed species classification.

### Clustering Performance on Risk Features

| Method | Silhouette Score |
|--------|------------------|
| K-Means (K = 3) | 0.01563 |
| Agglomerative | 0.00390 |
| DBSCAN | Single cluster found |

*Note: Higher Silhouette scores indicate better clustering. The analysis on standardised risk feature space shows distinct weed risk groupings.*

## 🌿 Supported Weed Classes

The model is trained to detect **9 weed species** commonly found in agricultural areas:

| Class ID | Weed Species | Common Name |
|----------|-------------|-------------|
| 0 | Non-weed | Crop/Non-target |
| 1 | Chinee Apple | *Ziziphus mauritiana* |
| 2 | Lantana | *Lantana camara* |
| 3 | Parkinsonia | *Parkinsonia aculeata* |
| 4 | Parthenium | *Parthenium hysterophorus* |
| 5 | Prickly Acacia | *Vachellia nilotica* |
| 6 | Rubber Vine | *Cryptostegia grandiflora* |
| 7 | Siam Weed | *Chromolaena odorata* |
| 8 | Snake Weed | *Stachytarpheta* |

## 📁 Project Structure

```
shiwar_samvad1/
│
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── routes/            # API endpoints
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helper functions
│   ├── main.py                # Application entry point
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # State management
│   │   ├── services/          # API integration
│   │   └── App.jsx            # Root component
│   ├── package.json           # Node dependencies
│   └── .env                   # Environment variables
│
├── artifacts/                  # Model artifacts
│   ├── *.pt                   # PyTorch models
│   ├── *.keras                # Keras models
│   ├── history.json           # Training history
│   └── label_map.json         # Class mappings
│
├── checkpoints/                # Model checkpoints
│   └── vit-coco-weed/         # ViT fine-tuned weights
│
├── Deepweeds(Data)/           # Training dataset (not in repo)
├── Non Weed Dataset/          # Augmentation data (not in repo)
│
├── train_model.py             # Model training script
├── train_vit_coco_weighted.py # ViT training with class weights
├── .gitignore                 # Git ignore patterns
└── README.md                  # Project documentation
```

## 🚀 Quick Start (Windows)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
___

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
___

## 🤖 AI Models

### Vision Transformer (ViT)

- **Model**: `google/vit-base-patch16-224`
- **Fine-tuning**: DeepWeeds dataset (17,509 images)
- **Classes**: 9 (8 weed species + non-weed)
- **Input Size**: 224×224 RGB
- **Framework**: PyTorch + Hugging Face Transformers
- **Hosted**: [HuggingFace - vit_coco_weed](https://huggingface.co/Atharva2023254/vit_coco_weed)

### Real-ESRGAN

- **Purpose**: Image super-resolution and enhancement
- **Model**: RealESRGAN_x4plus
- **Application**: Blur correction before classification
- **Framework**: PyTorch
- **Hosted**: [HuggingFace - realesgran](https://huggingface.co/Atharva2023254/realesgran)

> **Note**: Models exceed GitHub's 100MB limit and are hosted on HuggingFace Hub

## 🔗 Links

**Live Demo**: https://shiwar-samvad1.vercel.app

**API**: https://shiwar-samvad1.onrender.com

**Models**: https://huggingface.co/Atharva2023254

**Deployment**:
 Frontend:Vercel 
 Backend:Render 
 Database:MongoDB Atlas

**Data Source**: https://drive.google.com/drive/folders/1q0KnjmySuEkj2uppKZevigVl9_Stucca?usp=sharing
