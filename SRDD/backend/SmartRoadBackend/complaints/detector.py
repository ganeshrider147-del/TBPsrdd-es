"""
AI Damage Detection using YOLOv8.
Uses the custom-trained best.pt model.
"""
import os
import logging

logger = logging.getLogger(__name__)

# Absolute path to model — works from any cwd
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "best.pt")
_model = None


def _get_model():
    """Lazy-load the YOLO model (singleton)."""
    global _model
    if _model is None:
        from ultralytics import YOLO
        if not os.path.exists(_MODEL_PATH):
            raise FileNotFoundError(f"YOLO model not found at: {_MODEL_PATH}")
        _model = YOLO(_MODEL_PATH)
        logger.info(f"YOLO model loaded from {_MODEL_PATH}")
    return _model


def detect_damage(image_path):
    """
    Run YOLO inference on an image.

    Returns:
        dict with keys:
            - damage_type (str): 'Pothole', 'Crack', or 'No Damage Detected'
            - confidence (float): percentage 0-100
            - bounding_box (list|None): [x1, y1, x2, y2] in pixels
    """
    try:
        model = _get_model()
        results = model(image_path, verbose=False)

        damage_type = "No Damage Detected"
        confidence = 0.0
        bounding_box = None

        for result in results:
            if result.boxes is None or len(result.boxes) == 0:
                continue

            # Take the highest-confidence detection
            boxes = result.boxes
            best_idx = int(boxes.conf.argmax().item())
            cls = int(boxes.cls[best_idx].item())
            conf = float(boxes.conf[best_idx].item())
            box = boxes.xyxy[best_idx].tolist()

            raw_name = model.names[cls]

            # Normalize class names to standard labels
            name_lower = raw_name.lower()
            if any(x in name_lower for x in ["pothole", "pot hole", "hole"]):
                damage_type = "Pothole"
            elif any(x in name_lower for x in ["crack", "alligator", "linear", "fracture"]):
                damage_type = "Crack"
            else:
                damage_type = raw_name.title()

            confidence = round(conf * 100, 2)
            bounding_box = [round(v, 1) for v in box]
            break

        logger.info(f"Detection result: {damage_type} @ {confidence}%")
        return {
            "damage_type": damage_type,
            "confidence": confidence,
            "bounding_box": bounding_box,
        }

    except FileNotFoundError as e:
        logger.error(str(e))
        return {"damage_type": "No Damage Detected", "confidence": 0.0, "bounding_box": None}
    except Exception as e:
        logger.error(f"YOLO inference error: {e}")
        return {"damage_type": "No Damage Detected", "confidence": 0.0, "bounding_box": None}