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

device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
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
            summary_ids = model.generate(inputs['input_ids'], max_length=50, num_beams=1)  # Removed early_stopping
        batch_summaries = tokenizer.batch_decode(summary_ids, skip_special_tokens=True)
        summaries.extend(batch_summaries)
    return summaries

def generate_t5_embeddings(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128).to(device)
    with torch.no_grad():
        outputs = model.encoder(**inputs).last_hidden_state.mean(dim=1).detach().cpu().numpy()
    return outputs[0]

def train_and_save_artifacts():
    print("Loading synthetic dataset for pre-training...")
    dataset = load_dataset("ilsilfverskiold/linkedin_profiles_synthetic")
    df = pd.DataFrame(dataset['train'])
    df['user_type'] = np.random.choice(['student', 'alumni', 'officer'], len(df))

    print("Summarizing profiles to pre-train T5...")
    headlines = df['Headline'].tolist()
    df['summary'] = summarize_profiles_batch(headlines, batch_size=32)

    print("Generating T5 embeddings to pre-train model...")
    df['headline_embedding'] = [generate_t5_embeddings(text) for text in tqdm(df['Headline'])]
    df['summary_embedding'] = [generate_t5_embeddings(text) for text in tqdm(df['summary'])]
    df['combined_embedding'] = df.apply(lambda row: np.mean([row['headline_embedding'], row['summary_embedding']], axis=0), axis=1)

    # Initialize empty FAISS index
    index = faiss.IndexFlatL2(512)  # 512D embeddings

    # Ensure data directory exists
    os.makedirs('Recommender/data', exist_ok=True)
    with open('Recommender/data/faiss_index.pkl', 'wb') as f:
        pickle.dump(index, f)
    print("Empty FAISS index saved in Recommender/data/ for real data usage")

if __name__ == "__main__":
    train_and_save_artifacts()