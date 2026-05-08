FROM python:3.10

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python build_pipeline.py && python build_video_pipeline.py

EXPOSE 5001

CMD ["python", "chatbot_api.py"]