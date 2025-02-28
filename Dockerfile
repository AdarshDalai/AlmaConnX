FROM python:3.9-slim
WORKDIR /app
COPY Backend/requirements.txt .
RUN pip install -r requirements.txt
COPY Backend/ ./Backend/
COPY Recommender/ ./Recommender/
CMD ["uvicorn", "Backend.main:app", "--host", "0.0.0.0", "--port", "80"]