"""
AI Damage Detection using YOLOv8.
Uses the custom-trained best.pt model.
Generates annotated images with bounding boxes.
"""
import os
import logging
from pathlib import Path

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
            logger.critical(f"❌ YOLO model file NOT FOUND at: {_MODEL_PATH}")
            logger.critical(f"   Directory contents: {os.listdir(os.path.dirname(__file__))}")
            raise FileNotFoundError(f"YOLO model not found at: {_MODEL_PATH}")
        try:
            _model = YOLO(_MODEL_PATH)
            logger.info(f"✓ YOLO model successfully loaded from {_MODEL_PATH}")
            # Log model class names for debugging
            try:
                class_names = _model.names
                logger.info(f"  Model classes: {class_names}")
            except Exception as e:
                logger.warning(f"  Could not log model classes: {e}")
        except Exception as e:
            logger.critical(f"❌ FAILED to load YOLO model: {e}")
            raise
    return _model


def detect_damage(image_path, save_annotated_path=None):
    """
    Run YOLO inference on an image and optionally save annotated version.

    Args:
        image_path: Path to input image
        save_annotated_path: Optional path to save annotated image with bounding boxes

    Returns:
        dict with keys:
            - damage_type (str): 'Pothole', 'Crack', 'Alligator Crack', etc. or 'No Damage Detected'
            - confidence (float): percentage 0-100
            - bounding_box (list|None): [x1, y1, x2, y2] in pixels
            - annotated_image_path (str|None): Path to saved annotated image if requested
    """
    logger.info(f"[DETECT] ====== STARTING DETECTION ======")
    logger.info(f"[DETECT] Input image: {image_path}")
    
    try:
        from PIL import Image
        
        # Verify image exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at: {image_path}")
        
        logger.info(f"[DETECT] ✓ Image file exists")
        
        # Load and validate image with PIL first
        pil_img = Image.open(image_path)
        logger.info(f"[DETECT] PIL Image size: {pil_img.size}, mode: {pil_img.mode}")
        
        # Ensure image is in RGB format for consistent YOLO processing
        if pil_img.mode in ('RGBA', 'LA', 'P'):
            pil_img = pil_img.convert('RGB')
            logger.info(f"[DETECT] Converted from {pil_img.mode} to RGB")
        elif pil_img.mode == 'CMYK':
            pil_img = pil_img.convert('RGB')
            logger.info(f"[DETECT] Converted from CMYK to RGB")
        elif pil_img.mode == 'L':
            pil_img = pil_img.convert('RGB')
            logger.info(f"[DETECT] Converted from L to RGB")
        
        logger.info(f"[DETECT] ✓ Image normalized to mode: {pil_img.mode}")
        
        # Get model
        model = _get_model()
        logger.info(f"[DETECT] ✓ Model loaded")
        
        # Run YOLO inference with low confidence to catch weak signals
        logger.info(f"[DETECT] Running YOLO inference with conf=0.05...")
        results = model(pil_img, conf=0.05, verbose=False)
        logger.info(f"[DETECT] ✓ YOLO inference complete, returned {len(results)} result(s)")

        damage_type = "No Damage Detected"
        confidence = 0.0
        bounding_box = None
        best_result = None

        # Process results
        for result_idx, result in enumerate(results):
            num_boxes = len(result.boxes) if result.boxes is not None else 0
            logger.info(f"[DETECT] Result {result_idx}: found {num_boxes} detection(s)")
            
            if result.boxes is None or len(result.boxes) == 0:
                logger.info(f"[DETECT]   → No boxes in result {result_idx}")
                continue

            # Take the highest-confidence detection
            boxes = result.boxes
            best_idx = int(boxes.conf.argmax().item())
            cls = int(boxes.cls[best_idx].item())
            conf = float(boxes.conf[best_idx].item())
            box = boxes.xyxy[best_idx].tolist()

            # Get class name - handle both dict and list formats
            try:
                if isinstance(model.names, dict):
                    raw_name = model.names.get(cls, f"Class_{cls}")
                    logger.info(f"[DETECT]   model.names is dict, class name: {raw_name}")
                elif isinstance(model.names, (list, tuple)):
                    raw_name = model.names[cls] if cls < len(model.names) else f"Class_{cls}"
                    logger.info(f"[DETECT]   model.names is list, class name: {raw_name}")
                else:
                    logger.warning(f"[DETECT]   model.names is unexpected type: {type(model.names)}, treating as dict")
                    raw_name = model.names.get(cls, f"Class_{cls}") if hasattr(model.names, 'get') else f"Class_{cls}"
            except Exception as e:
                logger.error(f"[DETECT] ❌ Error accessing class name at index {cls}: {e}", exc_info=True)
                raw_name = f"Class_{cls}"
            
            logger.info(f"[DETECT] → Best detection: class_id={cls}, class_name='{raw_name}', conf={conf:.4f} (raw)")

            # Normalize class names to standard labels
            name_lower = raw_name.lower()
            if any(x in name_lower for x in ["pothole", "pot hole", "hole", "pit"]):
                damage_type = "Pothole"
            elif any(x in name_lower for x in ["crack", "alligator", "linear", "fracture", "longitudinal", "transverse"]):
                damage_type = "Crack"
            elif any(x in name_lower for x in ["surface", "damage", "road"]):
                damage_type = "Surface Damage"
            else:
                # Only set to "No Damage Detected" if explicitly named as such
                if raw_name.lower() in ["background", "no damage", "nodamage"]:
                    damage_type = "No Damage Detected"
                else:
                    damage_type = raw_name.title()

            confidence = round(conf * 100, 2)
            bounding_box = [round(v, 1) for v in box]
            best_result = result  # Save result for annotation
            
            logger.info(f"[DETECT] ✓ DETECTED: {damage_type} @ {confidence}%")
            logger.info(f"[DETECT]   Bounding box: {bounding_box}")
            break  # Use first (highest confidence) detection

        if damage_type == "No Damage Detected":
            logger.info(f"[DETECT] ⚠ No damage detected in this image")
        
        annotated_image_path = None
        
        # Generate annotated image if requested
        if save_annotated_path and best_result is not None:
            try:
                logger.info(f"[DETECT] Generating annotated image...")
                # Use YOLO's built-in plotting
                try:
                    annotated_array = best_result.plot()  # Returns numpy array with boxes drawn
                except Exception as plot_error:
                    logger.warning(f"[DETECT] result.plot() failed: {plot_error}, trying alternative method...")
                    # Fallback: try to get the frame from the result
                    if hasattr(best_result, 'orig_img'):
                        annotated_array = best_result.orig_img
                    else:
                        annotated_array = None
                
                if annotated_array is not None:
                    # Convert numpy array to PIL Image
                    if annotated_array.dtype != 'uint8':
                        # Ensure array is uint8 (0-255 range)
                        import numpy as np
                        annotated_array = (annotated_array * 255).astype('uint8') if annotated_array.max() <= 1 else annotated_array.astype('uint8')
                    
                    annotated_pil = Image.fromarray(annotated_array)
                    
                    # Ensure save directory exists
                    save_dir = os.path.dirname(save_annotated_path)
                    os.makedirs(save_dir, exist_ok=True)
                    
                    # Save annotated image
                    annotated_pil.save(save_annotated_path, quality=95)
                    logger.info(f"[DETECT] ✓ Annotated image saved to: {save_annotated_path}")
                    annotated_image_path = save_annotated_path
                else:
                    logger.warning(f"[DETECT] ⚠ result.plot() returned None, skipping annotation")
            except Exception as e:
                logger.error(f"[DETECT] Error generating annotated image: {e}", exc_info=True)
                # Don't fail the detection, just skip annotation
        
        logger.info(f"[DETECT] ====== DETECTION COMPLETE ======")
        logger.info(f"[DETECT] Final result: {damage_type} ({confidence}%)")
        
        return {
            "damage_type": damage_type,
            "confidence": confidence,
            "bounding_box": bounding_box,
            "annotated_image_path": annotated_image_path,
        }

    except FileNotFoundError as e:
        logger.error(f"[DETECT] ❌ File error: {e}")
        raise
    except Exception as e:
        logger.error(f"[DETECT] ❌ INFERENCE ERROR: {e}", exc_info=True)
        raise