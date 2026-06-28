from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(
    data="G:/SRDD/dataset/data.yaml",
    epochs=50,
    imgsz=640
)        