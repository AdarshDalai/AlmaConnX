import numpy as np
import pandas as pd
from sklearn.preprocessing import normalize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import faiss
from gensim.models import Word2Vec
from pymilvus import connections, Collection, DataType, utility
from collections import Counter

# Connect to Milvus for scalable vector storage
connections.connect("default", host="localhost", port="19530")

# Load dataset (synthetic data for training/testing)
dataset = load_dataset("ilsilfverskiold/linkedin_profiles_synthetic")
df = pd.DataFrame(dataset['train'])

# Detect text features dynamically
def detect_text_features(df):
    return [col for col in df.columns if df[col].dtype == 'object']

text_features = detect_text_features(df)

# Generate Word2Vec embeddings
def generate_word2vec_embeddings(df, feature):
    sentences = df[feature].dropna().apply(lambda x: x.split(", ") if isinstance(x, str) else [])
    model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)
    df[f'{feature}_embedding'] = sentences.apply(lambda words: np.mean([model.wv[w] for w in words if w in model.wv] or [np.zeros(100)], axis=0))
    return df, model

embedding_models = {}
for feature in text_features:
    df, model = generate_word2vec_embeddings(df, feature)
    embedding_models[feature] = model

# Combine all embeddings
def combine_embeddings(row):
    embeddings = [row[f'{feature}_embedding'] for feature in text_features if f'{feature}_embedding' in row]
    return np.mean(embeddings, axis=0)

df['combined_embedding'] = df.apply(combine_embeddings, axis=1)

# Normalize embeddings
all_embeddings = np.stack(df['combined_embedding'].values)
all_embeddings = normalize(all_embeddings)

# Store real user embeddings separately
real_users = df[~df['FirstName'].str.contains("Synthetic")]
real_embeddings = normalize(np.stack(real_users['combined_embedding'].values))

# FAISS Index for real user search
index_real = faiss.IndexFlatL2(real_embeddings.shape[1])
index_real.add(real_embeddings)

# Milvus Collection
if not utility.has_collection("user_embeddings"):
    collection = Collection("user_embeddings", fields=[
        {"name": "id", "dtype": DataType.INT64, "is_primary": True},
        {"name": "embedding", "dtype": DataType.FLOAT_VECTOR, "params": {"dim": 100}}
    ])
    collection.insert([[i for i in range(len(real_users))], real_embeddings.tolist()])

# Extract context from user query
def extract_context_from_query(query):
    words = query.lower().split()
    keywords = [word for word in words if word in embedding_models['Skills'].wv]
    return np.mean([embedding_models['Skills'].wv[w] for w in keywords] or [np.zeros(100)], axis=0)

# Recommendation function
def get_contextual_recommendations(user_idx, query, top_n=5):
    user_embedding = real_embeddings[user_idx].reshape(1, -1)
    query_embedding = extract_context_from_query(query).reshape(1, -1)
    
    combined_embedding = normalize(user_embedding + query_embedding)
    distances, indices = index_real.search(combined_embedding, top_n + 1)
    return real_users.iloc[indices[0][1:]][['FirstName', 'LastName', 'Headline']]

# Example Test
existing_user_idx = 100
existing_user_name = f"{real_users.iloc[existing_user_idx]['FirstName']} {real_users.iloc[existing_user_idx]['LastName']}"
query = "Looking for AI and Machine Learning experts"
print(f"Recommendations for {existing_user_name} based on query: {query}")
print(get_contextual_recommendations(existing_user_idx, query, 5))
