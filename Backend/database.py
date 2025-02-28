from pymongo import MongoClient
from time import sleep
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

def get_mongo_client():
    atlas_uri = os.getenv("MONGODB_URI")
    if not atlas_uri:
        raise ValueError("MONGODB_URI not set in .env file")
    for _ in range(10):  # Retry 10 times
        try:
            client = MongoClient(atlas_uri)
            client.server_info()  # Test connection
            return client
        except Exception as e:
            print(f"Failed to connect to MongoDB Atlas: {e}, retrying in 2 seconds...")
            sleep(2)
    raise Exception("Failed to connect to MongoDB Atlas after retries")

client = get_mongo_client()
db = client["career_platform"]
users_collection = db["users"]