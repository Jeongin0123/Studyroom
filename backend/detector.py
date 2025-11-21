import torch
from torchvision import transforms
from PIL import Image
import io
import os

# 모델 파일 경로
MODEL_PATH = os.path.join("model", "best_model.pth")

# GPU 사용 가능하면 GPU 사용
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------
# 1) 모델 정의 import   
# -----------------------------
from model.model import YawnCNN   # 네 모델 이름으로 변경 필요

# -----------------------------
# 2) 모델 로드
# -----------------------------
model = YawnCNN()
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

# -----------------------------
# 3) 이미지 전처리 정의
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.ToTensor()
])

# -----------------------------
# 4) 예측 함수
# -----------------------------
def predict_drowsiness(image_bytes: bytes):
    # 바이트 → PIL 이미지
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_tensor)
        _, predicted = torch.max(output, 1)

    # 0/1/2 같은 라벨 → 문자열 변환
    class_map = {0: "Normal", 1: "Yawn", 2: "Sleepy"}
    return class_map[int(predicted.item())]
