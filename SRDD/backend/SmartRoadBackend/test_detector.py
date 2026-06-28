# test_detector.py

from complaints.detector import detect_damage

result = detect_damage(
    "media/complaints/1775835276580-446101186.jpg"
)

print(result)