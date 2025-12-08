import torch
from torchvision import transforms
from PIL import Image
import io
import cv2
import numpy as np
import mediapipe as mp
from collections import deque

MODEL_PATH = "backend/best_model_Yawn_fold4.pth"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 모델 import
from backend.best_model import YawnCNN

model = YawnCNN(num_classes=3)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

# 전처리 (학습 시와 동일하게 Normalization 추가)
transform = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5],
                         std=[0.5, 0.5, 0.5])
])

# Mediapipe face detection (테스트 코드와 동일하게 0.4로 설정)
mp_face = mp.solutions.face_detection
face_detector = mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.4)

# 🎯 다수결 투표 버퍼 (테스트 코드와 동일)
prediction_buffer = deque(maxlen=10)

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
        probabilities = torch.softmax(output, dim=1)[0]
        
        # 🔬 디버깅: raw logits 출력
        print(f"🔬 Raw logits: {output[0].cpu().numpy()}")
        
        # ⚖️ 클래스 가중치 조정
        # Sleepy는 부스트 (8배 증가), Normal/Yawn은 페널티 (60% 감소)
        adjusted_probs = probabilities.clone()
        adjusted_probs[0] *= 1.2  # Normal 증가
        adjusted_probs[1] *= 1.0  # Sleepy 대폭 증가
        adjusted_probs[2] *= 0.6 # Yawn 감소
        
        # 조정된 확률로 재정규화
        adjusted_probs = adjusted_probs / adjusted_probs.sum()
        
        # 임계값 기반 예측: Yawn은 조정 후에도 0.7 이상이어야 함
        predicted = torch.argmax(adjusted_probs).item()
        if predicted == 2 and adjusted_probs[2] < 0.7:
            # Yawn 확률이 충분히 높지 않으면 Normal 또는 Sleepy 선택
            predicted = 0 if adjusted_probs[0] > adjusted_probs[1] else 1
        
        confidence = adjusted_probs[predicted].item()

    class_map = {0: "Normal", 1: "Sleepy", 2: "Yawn"}
    current_prediction = class_map[predicted]
    
    # 🎯 실시간 예측 (다수결 투표 비활성화)
    # 버퍼는 유지하지만 최종 결과는 현재 프레임만 사용
    prediction_buffer.append(current_prediction)
    final_result = current_prediction  # 실시간 반영
    
    # 디버깅용: 확률 출력
    print(f"🔍 Current: {current_prediction} (confidence: {confidence:.3f})")
    print(f"   Original: Normal={probabilities[0]:.3f}, Sleepy={probabilities[1]:.3f}, Yawn={probabilities[2]:.3f}")
    print(f"   Adjusted: Normal={adjusted_probs[0]:.3f}, Sleepy={adjusted_probs[1]:.3f}, Yawn={adjusted_probs[2]:.3f}")
    print(f"   ⚡ Real-time mode (no buffering)")
    
    return final_result