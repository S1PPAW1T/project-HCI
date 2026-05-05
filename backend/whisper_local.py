import whisper
import sys

model = whisper.load_model("base")  # เปลี่ยนเป็น small/medium ได้
result = model.transcribe(sys.argv[1])

print(result["text"])