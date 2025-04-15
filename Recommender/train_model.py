# Recommender/train_model.py
import numpy as np
import pandas as pd
from transformers import T5Tokenizer, T5ForConditionalGeneration
from sklearn.preprocessing import normalize
import faiss
from datasets import load_dataset
from tqdm import tqdm
import torch
import pickle
import os

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

def train_and_save_artifacts():
    print("Loading synthetic dataset for pre-training...")
    dataset = load_dataset("ilsilfverskiold/linkedin_profiles_synthetic")
    df = pd.DataFrame(dataset['train'])
    df['userType'] = np.random.choice(['student', 'alumni', 'officer'], len(df))
    df['aboutMe'] = df['Headline'].apply(lambda x: f"Professional with expertise in {x.lower()}.")
    df['skills'] = df['Headline'].apply(lambda x: x.lower().split()[:5])
    df['experience'] = df['Headline'].apply(lambda x: [{"title": x, "company": "Synthetic Corp"}])
    df['education'] = df['Headline'].apply(lambda x: [{"degree": "BS", "field": x}])

    print("Summarizing profiles...")
    full_texts = df.apply(lambda row: " ".join([
        str(row['Headline']),
        str(row['aboutMe']),
        " ".join(row['skills']),
        " ".join(exp['title'] for exp in row['experience']),
        " ".join(edu['degree'] for edu in row['education'])
    ]), axis=1).tolist()
    df['summary'] = summarize_profiles_batch(full_texts, batch_size=32)

    print("Generating T5 embeddings...")
    df['full_embedding'] = [generate_t5_embeddings(text) for text in tqdm(full_texts)]
    df['summary_embedding'] = [generate_t5_embeddings(text) for text in tqdm(df['summary'])]
    df['combined_embedding'] = df.apply(lambda row: np.mean([row['full_embedding'], row['summary_embedding']], axis=0), axis=1)

    # Initialize FAISS index
    index = faiss.IndexFlatL2(512)
    os.makedirs('Recommender/data', exist_ok=True)
    with open('Recommender/data/faiss_index.pkl', 'wb') as f:
        pickle.dump(index, f)
    print("Empty FAISS index saved in Recommender/data/")

if __name__ == "__main__":
    train_and_save_artifacts()
