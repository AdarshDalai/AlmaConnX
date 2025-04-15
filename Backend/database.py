from pymongo import MongoClient
from time import sleep
from dotenv import load_dotenv
import os
import logging
import ssl

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def get_mongo_client():
    atlas_uri = os.getenv("MONGO_NIRMAL")
    logger.info(f"Loaded MONGO_NIRMAL: {atlas_uri if atlas_uri else 'Not set'}")
    if not atlas_uri:
        raise ValueError("MONGODB_URI not set in .env file")
    for _ in range(10):  # Retry 10 times
        try:
            client = MongoClient(
                atlas_uri,
                serverSelectionTimeoutMS=5000
            )
            client.server_info()  # Test connection
            logger.info("Connected to MongoDB Atlas successfully")
            return client
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {e}, retrying in 2 seconds...")
            sleep(2)
    raise Exception("Failed to connect to MongoDB Atlas after retries")

client = get_mongo_client()
db = client["almax"]
users_collection = db["users"]