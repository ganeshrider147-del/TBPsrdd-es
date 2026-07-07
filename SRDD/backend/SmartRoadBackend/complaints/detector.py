"""
AI Damage Detection using YOLOv8.
Uses the custom-trained best.pt model.
"""
import os
import logging
import numpy as np

logger = logging.getLogger(__name__)

# Absolute path to model — works from any cwd
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "best.pt")
_pip_logs = []
_model = None


def _get_model():
    """Lazy-load the YOLO model (singleton)."""
    global _model
    if _model is None:
        from ultralytics import YOLO
        if not os.path.exists(_MODEL_PATH):
            logger.critical(f"YOLO model file NOT FOUND at: {_MODEL_PATH}")
            logger.critical(f"Directory contents: {os.listdir(os.path.dirname(__file__))}")
            raise FileNotFoundError(f"YOLO model not found at: {_MODEL_PATH}")
        try:
            _model = YOLO(_MODEL_PATH)
            logger.info(f"✓ YOLO model successfully loaded from {_MODEL_PATH}")
            logger.info(f"  Model info: {_model.model.yaml if hasattr(_model, 'model') else 'N/A'}")
        except Exception as e:
            logger.critical(f"FAILED to load YOLO model: {e}")
            raise
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
        from PIL import Image
        
        logger.info(f"[DETECT] Processing image: {image_path}")
        
        # Verify image exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at: {image_path}")
        
        # Load and validate image
        img = Image.open(image_path)
        logger.info(f"[DETECT] Image size: {img.size}, mode: {img.mode}")
        
        # Ensure image is in RGB format for consistent YOLO processing
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        elif img.mode == 'CMYK':
            img = img.convert('RGB')
        elif img.mode == 'L':
            img = img.convert('RGB')
            
        logger.info(f"[DETECT] Image normalized to mode: {img.mode}")
        
        # Get model
        model = _get_model()
        
        # Run with low confidence threshold to catch weak signals
        # But we'll validate them after
        logger.info(f"[DETECT] Running YOLO inference with conf=0.05...")
        results = model(img, conf=0.05, verbose=False)
        logger.info(f"[DETECT] YOLO returned {len(results)} result(s)")

        damage_type = "No Damage Detected"
        confidence = 0.0
        bounding_box = None

        for result_idx, result in enumerate(results):
            logger.info(f"[DETECT] Result {result_idx}: boxes={len(result.boxes) if result.boxes else 0}")
            
            if result.boxes is None or len(result.boxes) == 0:
                logger.info(f"[DETECT] No boxes found in result {result_idx}")
                continue

            # Take the highest-confidence detection
            boxes = result.boxes
            best_idx = int(boxes.conf.argmax().item())
            cls = int(boxes.cls[best_idx].item())
            conf = float(boxes.conf[best_idx].item())
            box = boxes.xyxy[best_idx].tolist()

            raw_name = model.names.get(cls, f"Class_{cls}")
            logger.info(f"[DETECT] Best detection: class={cls} ({raw_name}), conf={conf:.4f}")

            # Normalize class names to standard labels
            name_lower = raw_name.lower()
            if any(x in name_lower for x in ["pothole", "pot hole", "hole", "pit"]):
                damage_type = "Pothole"
            elif any(x in name_lower for x in ["crack", "alligator", "linear", "fracture", "longitudinal", "transverse"]):
                damage_type = "Crack"
            else:
                # Map any other detection to standard types
                damage_type = raw_name.title() if raw_name not in ["background", "no damage"] else "No Damage Detected"

            confidence = round(conf * 100, 2)
            bounding_box = [round(v, 1) for v in box]
            
            logger.info(f"[DETECT] ✓ Detected: {damage_type} @ {confidence}%")
            break

        if damage_type == "No Damage Detected":
            logger.info(f"[DETECT] No damage detected in image")
        
        return {
            "damage_type": damage_type,
            "confidence": confidence,
            "bounding_box": bounding_box,
        }

    except FileNotFoundError as e:
        logger.error(f"[DETECT] File error: {e}")
        raise
    except Exception as e:
        logger.error(f"[DETECT] Inference error: {e}", exc_info=True)
        raise