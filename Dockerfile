FROM python:3.11-bullseye
WORKDIR /app
RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
    && apt-get upgrade -y openssl \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY Backend/requirements.txt .
RUN pip install -r requirements.txt && pip install --upgrade setuptools>=70.0.0
COPY Backend/ ./Backend/
COPY Recommender/ ./Recommender/
CMD ["uvicorn", "Backend.main:app", "--host", "0.0.0.0", "--port", "80"]