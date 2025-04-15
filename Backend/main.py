# Backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from Recommender.models import recommend_with_prompt, update_user_embedding
from Backend.database import users_collection
import pandas as pd

app = FastAPI()

class SyncRequest(BaseModel):
    batch_size: int = 100

class UpdateEmbeddingRequest(BaseModel):
    user_id: str

@app.get("/recommend/{user_id}")
async def recommend(user_id: str, prompt: str, top_n: int = 5):
    try:
        matches, explanations = recommend_with_prompt(user_idx=user_id, prompt=prompt, top_n=top_n)
        return {"matches": matches.to_dict(orient='records'), "explanations": explanations}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/sync_embeddings")
async def sync_embeddings(request: SyncRequest):
    cursor = users_collection.find()
    total_updated = 0
    batch = []
    
    for user in cursor:
        if ("combined_embedding" not in user or not user["combined_embedding"] or
                ("updatedAt" in user and "embedding_updated_at" in user and
                 user["updatedAt"] > user["embedding_updated_at"])):
            batch.append(user)
        if len(batch) >= request.batch_size:
            for u in batch:
                try:
                    update_user_embedding(u["_id"])
                    total_updated += 1
                except ValueError:
                    continue
            batch = []
    
    for u in batch:
        try:
            update_user_embedding(u["_id"])
            total_updated += 1
        except ValueError:
            continue
    
    return {"status": "success", "users_updated": total_updated}

@app.post("/update_embedding")
async def update_embedding(request: UpdateEmbeddingRequest):
    try:
        update_user_embedding(request.user_id)
        return {"status": "success", "user_id": request.user_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.on_event("startup")
async def startup_event():
    users_collection.create_index([("userType", 1)])
    users_collection.create_index([("email", 1)], unique=True)