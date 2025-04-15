# Recommender/models.py
import pandas as pd
import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from Backend.database import users_collection
import faiss
import pickle
from datetime import datetime

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = T5Tokenizer.from_pretrained('t5-small')
model = T5ForConditionalGeneration.from_pretrained('t5-small').to(device)
model.eval()

def summarize_profiles_batch(texts, batch_size=32):
    summaries = []
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i + batch_size]
        input_texts = [f"summarize: {text}" for text in batch_texts if text]
        if not input_texts:
            summaries.extend([""] * len(batch_texts))
            continue
        inputs = tokenizer(input_texts, return_tensors="pt", max_length=256, truncation=True, padding=True).to(device)
        with torch.no_grad():
            summary_ids = model.generate(inputs['input_ids'], max_length=50, num_beams=1)
        batch_summaries = tokenizer.batch_decode(summary_ids, skip_special_tokens=True)
        summaries.extend(batch_summaries)
    return summaries

def generate_t5_embeddings(text):
    if not text or pd.isna(text):
        return np.zeros(512)
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128).to(device)
    with torch.no_grad():
        outputs = model.encoder(**inputs).last_hidden_state.mean(dim=1).detach().cpu().numpy()
    return outputs[0]

def generate_user_embedding(user):
    full_text = " ".join(filter(None, [
        str(user.get("fullname", "")),
        str(user.get("aboutMe", "")),
        str(user.get("department", "")),
        " ".join(str(skill) for skill in user.get("skills", [])),
        " ".join(str(exp.get("title", "")) for exp in user.get("experience", [])),
        " ".join(str(edu.get("degree", "")) for edu in user.get("education", []))
    ]))
    summary = summarize_profiles_batch([full_text])[0]
    full_embedding = generate_t5_embeddings(full_text)
    summary_embedding = generate_t5_embeddings(summary)
    combined_embedding = np.mean([full_embedding, summary_embedding], axis=0)
    normalized_embedding = normalize(combined_embedding.reshape(1, -1))[0]
    return normalized_embedding, summary

def update_user_embedding(user_id):
    user = users_collection.find_one({"_id": user_id})
    if not user:
        raise ValueError("User not found")
    normalized_embedding, summary = generate_user_embedding(user)
    users_collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "combined_embedding": normalized_embedding.tolist(),
                "summary": summary,
                "embedding_updated_at": datetime.utcnow()
            }
        }
    )
    return normalized_embedding

def recommend_with_prompt(user_idx, prompt, top_n=5):
    prompt_keywords, prompt_embedding = analyze_prompt(prompt)
    all_users = list(users_collection.find())
    if not all_users:
        raise ValueError("No real data available for recommendations")
    
    user = next((u for u in all_users if str(u["_id"]) == user_idx), None)
    if not user:
        raise ValueError("User not found in real data")
    
    # Check if user's embedding needs regeneration
    if ("combined_embedding" not in user or not user["combined_embedding"] or
            ("updatedAt" in user and "embedding_updated_at" in user and
             user["updatedAt"] > user["embedding_updated_at"])):
        user_embedding = update_user_embedding(user["_id"])
        user["combined_embedding"] = user_embedding.tolist()
    else:
        user_embedding = np.array(user["combined_embedding"])
    
    user_type = user.get("userType", "unknown")

    # Generate or update embeddings for all users
    index = faiss.IndexFlatL2(512)
    embeddings = []
    valid_users = []
    for candidate in all_users:
        if ("combined_embedding" not in candidate or not candidate["combined_embedding"] or
                ("updatedAt" in candidate and "embedding_updated_at" in candidate and
                 candidate["updatedAt"] > candidate["embedding_updated_at"])):
            normalized_embedding = update_user_embedding(candidate["_id"])
            candidate["combined_embedding"] = normalized_embedding.tolist()
        embeddings.append(np.array(candidate["combined_embedding"]))
        valid_users.append(candidate)
    
    if not embeddings:
        raise ValueError("No valid embeddings available for recommendations")
    
    # Rebuild FAISS index
    embeddings = np.array(embeddings)
    index.add(embeddings)
    with open('Recommender/data/faiss_index.pkl', 'wb') as f:
        pickle.dump(index, f)

    distances, indices = index.search(prompt_embedding.reshape(1, -1), min(top_n + 10, index.ntotal))
    candidate_indices = indices[0][1:]  # Exclude prompt itself if indexed
    
    scores = []
    for idx in candidate_indices:
        if idx >= len(valid_users):
            continue
        candidate = valid_users[idx]
        candidate_embedding = np.array(candidate["combined_embedding"])
        
        prompt_sim = cosine_similarity([prompt_embedding], [candidate_embedding])[0][0]
        user_sim = cosine_similarity([user_embedding], [candidate_embedding])[0][0]
        
        score = 0.7 * prompt_sim + 0.2 * user_sim
        
        if user_type == "student" and candidate.get("userType") == "alumni":
            score += 0.1
        elif user_type == "officer" and candidate.get("userType") == "alumni":
            score += 0.05
        
        candidate_text = " ".join([
            str(candidate.get("fullname", "")).lower(),
            str(candidate.get("aboutMe", "")).lower(),
            str(candidate.get("department", "")).lower(),
            " ".join(str(skill).lower() for skill in candidate.get("skills", [])),
            " ".join(str(exp.get("title", "")).lower() for exp in candidate.get("experience", [])),
            " ".join(str(edu.get("degree", "")).lower() for edu in candidate.get("education", []))
        ])
        keyword_overlap = len(set(prompt_keywords) & set(candidate_text.split())) / max(len(prompt_keywords), 1)
        score += 0.2 * keyword_overlap
        
        scores.append((idx, score, prompt_sim, user_sim, keyword_overlap))

    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    
    prompt_relevant = [s for s in scores if any(kw in candidate_text.lower() for kw in prompt_keywords for candidate_text in [
        valid_users[s[0]].get("fullname", ""),
        valid_users[s[0]].get("aboutMe", ""),
        valid_users[s[0]].get("department", "")
    ])]
    if not prompt_relevant:
        prompt_relevant = sorted(scores, key=lambda x: x[2], reverse=True)[:top_n]
    else:
        prompt_relevant = prompt_relevant[:top_n]

    top_indices = [s[0] for s in prompt_relevant]
    top_matches = pd.DataFrame([{
        "fullname": valid_users[idx].get("fullname"),
        "userType": valid_users[idx].get("userType"),
        "department": valid_users[idx].get("department"),
        "aboutMe": valid_users[idx].get("aboutMe")
    } for idx in top_indices])
    explanations = [f"Match {i+1}: Score={s[1]:.3f}, Prompt Similarity={s[2]:.3f}, User Similarity={s[3]:.3f}, Keyword Overlap={s[4]:.3f}" 
                    for i, s in enumerate(prompt_relevant)]
    return top_matches, explanations

def analyze_prompt(prompt):
    input_text = f"extract_keywords: {prompt}"
    inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True).to(device)
    output_ids = model.generate(inputs['input_ids'], max_length=50, num_beams=4)
    keywords = tokenizer.decode(output_ids[0], skip_special_tokens=True).split(", ")
    prompt_embedding = generate_t5_embeddings(prompt)
    return keywords, prompt_embedding