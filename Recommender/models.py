import pandas as pd
import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize

device = torch.device("cpu")  # Default for deployment; adjust if GPU available
tokenizer = T5Tokenizer.from_pretrained('t5-small')
model = T5ForConditionalGeneration.from_pretrained('t5-small').to(device)
model.eval()

def summarize_profiles_batch(texts, batch_size=32):
    summaries = []
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i + batch_size]
        input_texts = [f"summarize: {text}" for text in batch_texts]
        inputs = tokenizer(input_texts, return_tensors="pt", max_length=256, truncation=True, padding=True).to(device)
        with torch.no_grad():
            summary_ids = model.generate(inputs['input_ids'], max_length=50, num_beams=1)
        batch_summaries = tokenizer.batch_decode(summary_ids, skip_special_tokens=True)
        summaries.extend(batch_summaries)
    return summaries

def generate_t5_embeddings(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128).to(device)
    with torch.no_grad():
        outputs = model.encoder(**inputs).last_hidden_state.mean(dim=1).detach().cpu().numpy()
    return outputs[0]

def analyze_prompt(prompt):
    input_text = f"extract_keywords: {prompt}"
    inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True).to(device)
    output_ids = model.generate(inputs['input_ids'], max_length=50, num_beams=4)
    keywords = tokenizer.decode(output_ids[0], skip_special_tokens=True).split(", ")
    prompt_embedding = generate_t5_embeddings(prompt)
    return keywords, prompt_embedding

def recommend_with_prompt(user_idx, prompt, top_n=5, index=None, real_users=None):
    prompt_keywords, prompt_embedding = analyze_prompt(prompt)
    user = next((u for u in real_users if str(u["_id"]) == user_idx), None)
    if not user:
        raise ValueError("User not found in real data")
    user_embedding = np.array(user["combined_embedding"])
    user_type = user["user_type"]

    if index.ntotal == 0:
        raise ValueError("No real data available for recommendations")
    
    distances, indices = index.search(prompt_embedding.reshape(1, -1), min(top_n + 10, index.ntotal))
    candidate_indices = indices[0][1:]  # Exclude prompt itself if indexed
    
    scores = []
    for idx in candidate_indices:
        candidate = real_users[idx]
        candidate_embedding = np.array(candidate["combined_embedding"])
        
        # Similarity scores
        prompt_sim = cosine_similarity([prompt_embedding], [candidate_embedding])[0][0]
        user_sim = cosine_similarity([user_embedding], [candidate_embedding])[0][0]
        
        # Updated scoring: Higher prompt priority, user similarity as tiebreaker
        score = 0.8 * prompt_sim + 0.2 * user_sim
        
        # Bonus for user_type alignment (e.g., student -> alumni)
        if user_type == "student" and candidate["user_type"] == "alumni":
            score += 0.1
        
        # Bonus for keyword overlap with prompt
        headline_keywords = candidate["headline"].lower().split()
        keyword_overlap = len(set(prompt_keywords) & set(headline_keywords)) / len(prompt_keywords)
        score += 0.2 * keyword_overlap
        
        scores.append((idx, score, prompt_sim, user_sim, keyword_overlap))

    # Sort by score, prioritizing prompt relevance
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    
    # Filter for prompt-relevant candidates (e.g., blockchain developers)
    prompt_relevant = [s for s in scores if any(kw in real_users[s[0]]["headline"].lower() for kw in prompt_keywords)]
    if not prompt_relevant:
        # Fallback: Top scoring candidates if no exact matches
        prompt_relevant = scores[:top_n]
    else:
        # Take top N from prompt-relevant candidates
        prompt_relevant = prompt_relevant[:top_n]

    top_indices = [s[0] for s in prompt_relevant]
    top_matches = pd.DataFrame([real_users[idx] for idx in top_indices])[['first_name', 'last_name', 'user_type', 'headline']]
    explanations = []
    for i, s in enumerate(prompt_relevant):
        candidate = real_users[s[0]]
        score_explanation = f"Match {i+1}: Score={s[1]:.3f}, Prompt Similarity={s[2]:.3f}, User Similarity={s[3]:.3f}, Keyword Overlap={s[4]:.3f}"
        rag_explanation = (
            f"RAG Explanation: "
            f"Retrieval: This candidate was retrieved using FAISS search, which identified profiles with embeddings closest to the prompt embedding (cosine distance). "
            f"Augmentation: The score was computed as 0.8*prompt_similarity ({s[2]:.3f}) + 0.2*user_similarity ({s[3]:.3f}). "
        )
        if user_type == "student" and candidate["user_type"] == "alumni":
            rag_explanation += "A 0.1 bonus was added for student-alumni alignment. "
        if s[4] > 0:
            rag_explanation += f"A 0.2*keyword_overlap ({s[4]:.3f}) bonus was added for matching prompt keywords in the headline. "
        rag_explanation += (
            f"Generation: This candidate was ranked as match {i+1} based on the combined score ({s[1]:.3f}), prioritizing prompt relevance and user alignment."
        )
        explanations.append(f"{score_explanation}. {rag_explanation}")
    
    return top_matches, explanations