import torch
from torchvision import transforms
from PIL import Image
import io
import cv2
import numpy as np
import mediapipe as mp

# ---------------------------
# 모델 로드 준비
# ---------------------------

MODEL_PATH = "backend/best_model_Yawn_fold4.pth"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 모델 import
from backend.best_model import YawnCNN

model = YawnCNN(num_classes=3)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

# 전처리
transform = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.ToTensor()
])

# Mediapipe face detection
mp_face = mp.solutions.face_detection
face_detector = mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.7)

# ---------------------------
# 얼굴 + 졸음 탐지 함수
# ---------------------------
def predict_drowsiness(image_bytes: bytes):
    # 바이트 → OpenCV 이미지
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    # Mediapipe 얼굴 검출
    results = face_detector.process(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))

    if not results.detections:
        return "No Face"

    # 첫 번째 얼굴만 사용
    det = results.detections[0]
    h, w, _ = img_cv.shape

    bbox = det.location_data.relative_bounding_box
    x1 = int(bbox.xmin * w)
    y1 = int(bbox.ymin * h)
    x2 = int((bbox.xmin + bbox.width) * w)
    y2 = int((bbox.ymin + bbox.height) * h)

    # 얼굴 crop
    face = img_cv[max(0, y1):y2, max(0, x1):x2]

    if face.size == 0:
        return "No Face"

    face_pil = Image.fromarray(cv2.cvtColor(face, cv2.COLOR_BGR2RGB))

    # 전처리
    img_tensor = transform(face_pil).unsqueeze(0).to(device)

    # 예측
    with torch.no_grad():
        output = model(img_tensor)
        _, predicted = torch.max(output, 1)

    class_map = {0: "Normal", 1: "Yawn", 2: "Sleepy"}
    return class_map[int(predicted.item())]
