from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.preprocessing import normalize
from Recommender.models import summarize_profiles_batch, generate_t5_embeddings, recommend_with_prompt, tokenizer, model
from Backend.database import users_collection  # Absolute import within Backend
import numpy as np
import faiss
import pickle
from datetime import datetime
import pandas as pd

app = FastAPI()

# Load empty FAISS index
with open('Recommender/data/faiss_index.pkl', 'rb') as f:
    index = pickle.load(f)

class UserInput(BaseModel):
    first_name: str
    last_name: str
    headline: str
    user_type: str

@app.post("/add_user")
async def add_user(user: UserInput):
    summary = summarize_profiles_batch([user.headline])[0]
    headline_embedding = generate_t5_embeddings(user.headline)
    summary_embedding = generate_t5_embeddings(summary)
    combined_embedding = np.mean([headline_embedding, summary_embedding], axis=0)
    normalized_embedding = normalize(combined_embedding.reshape(1, -1))[0]

    user_doc = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "user_type": user.user_type,
        "headline": user.headline,
        "summary": summary,
        "combined_embedding": normalized_embedding.tolist(),
        "created_at": datetime.utcnow()
    }
    user_id = users_collection.insert_one(user_doc).inserted_id
    index.add(np.array([normalized_embedding]))
    with open('Recommender/data/faiss_index.pkl', 'wb') as f:
        pickle.dump(index, f)  # Persist updated index
    return {"user_id": str(user_id)}

@app.get("/recommend/{user_id}")
async def recommend(user_id: str, prompt: str, top_n: int = 5):
    all_users = list(users_collection.find())
    if not all_users:
        raise HTTPException(status_code=404, detail="No real data available yet")
    
    try:
        matches, explanations = recommend_with_prompt(user_idx=user_id, prompt=prompt, top_n=top_n, 
                                                      index=index, real_users=all_users)
        return {"matches": matches.to_dict(orient='records'), "explanations": explanations}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.on_event("startup")
async def startup_event():
    users_collection.create_index([("user_type", 1)])