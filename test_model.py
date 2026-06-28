from ultralytics import YOLO

model = YOLO(r"G:\SRDD\backend\SmartRoadBackend\complaints\best.pt")

print(model.names)