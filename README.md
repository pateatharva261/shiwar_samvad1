# 🌾 AI-Powered Weed Detection & Herbicide Recommendation System

## 📖 Project Description

Shiwar Samvad is an AI-powered precision agriculture platform that helps farmers identify weed species from field images and receive intelligent, species-specific herbicide recommendations. The system leverages Vision Transformer (ViT) for accurate weed classification and integrates Real-ESRGAN for enhancing low-quality or blurry images before prediction. By combining deep learning, generative AI, and decision-support capabilities, the platform promotes sustainable farming practices, reduces unnecessary herbicide usage, and improves crop safety.
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
| K-Means (K = 9) | 0.01563 |
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
shiwar_samvad1-main/
│
├── backend/                           # FastAPI Backend
│   ├── app/
│   │   ├── core/                     # Core configurations
│   │   │   ├── config.py            # Application settings
│   │   │   └── __init__.py
│   │   ├── models/                   # MongoDB models
│   │   │   └── __init__.py
│   │   ├── routes/                   # API endpoints
│   │   │   ├── auth_routes.py       # Authentication endpoints
│   │   │   ├── detection_routes.py  # Weed detection endpoints
│   │   │   ├── chatbot_routes.py    # AI chatbot endpoints
│   │   │   ├── calculator_routes.py # Dosage calculator
│   │   │   └── __init__.py
│   │   ├── services/                 # Business logic layer
│   │   │   ├── vit_service.py       # ViT model inference
│   │   │   ├── enhancement_service.py # Image enhancement (Real-ESRGAN)
│   │   │   ├── herbicide_service.py  # Recommendation engine
│   │   │   ├── chatbot_service.py    # Groq AI integration
│   │   │   ├── calculator_service.py # Dosage calculations
│   │   │   └── __init__.py
│   │   ├── utils/                    # Helper utilities
│   │   │   └── __init__.py
│   │   ├── database.py              # MongoDB connection
│   │   ├── schemas.py               # Pydantic schemas
│   │   └── __init__.py
│   ├── main.py                       # FastAPI application entry
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment template
│   └── __init__.py
│
├── frontend/                          # React 19 + Vite Frontend
│   ├── src/
│   │   ├── assets/                   # Static assets (images, icons)
│   │   ├── components/               # Reusable React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── DetectionCard.jsx
│   │   │   └── ...
│   │   ├── context/                  # React Context API
│   │   │   └── AuthContext.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Detection.jsx
│   │   │   ├── Calculator.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── History.jsx
│   │   │   └── ...
│   │   ├── services/                 # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Application entry
│   │   └── styles.css                # Tailwind CSS
│   ├── index.html                    # HTML template
│   ├── package.json                  # Node dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   └── .env.example                  # Environment template
│
├── hf_space/                          # Hugging Face Space deployment
│   └── gradio_vit/                   # Gradio demo app
│       ├── app.py                    # Gradio interface
│       └── requirements.txt          # Python dependencies
│
├── .gitignore                         # Git ignore patterns
└── README.md                          # Project documentation
```

## 📦 Models on Hugging Face

All AI models are hosted on Hugging Face Hub due to GitHub's file size limitations:

### 🤖 Vision Transformer (ViT) - Weed Classification
- **Repository**: [`Atharva2023254/vit_coco_weed`](https://huggingface.co/Atharva2023254/vit_coco_weed)
- **Base Model**: `google/vit-base-patch16-224`
- **Fine-tuned on**: DeepWeeds dataset (17,509 images)
- **Classes**: 9 (8 weed species + non-weed)
- **Accuracy**: 95.13%
- **Input**: 224×224 RGB images

### 🔍 Real-ESRGAN - Image Enhancement
- **Repository**: [`Atharva2023254/realesgran`](https://huggingface.co/Atharva2023254/realesgran)
- **Model**: RealESRGAN_x4plus
- **Purpose**: Super-resolution and blur correction
- **Application**: Pre-processing before weed classification

> 💡 **Note**: Models are automatically downloaded from Hugging Face Hub when the backend starts for the first time.

## 🚀 Quick Start 

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

## 🔗 Important Links

**🌐 Live Demo**: https://shiwar-samvad1.vercel.app

**🤗 Hugging Face Models**: https://huggingface.co/Atharva2023254

**📊 Dataset**: https://drive.google.com/drive/folders/1q0KnjmySuEkj2uppKZevigVl9_Stucca

**☁️ Deployment**:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas


