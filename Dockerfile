FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY Backend/requirements.txt .

# Upgrade pip to the latest version before installing dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy application files
COPY Backend/ ./Backend/
COPY Recommender/ ./Recommender/

# Run the application with Uvicorn
CMD ["uvicorn", "Backend.main:app", "--host", "0.0.0.0", "--port", "80"]