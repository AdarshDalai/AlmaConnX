**# Context-Aware Recommendation System Documentation**

## **Overview**
This document details the implementation of a **context-aware recommendation system** using **synthetic LinkedIn profile data** for training and testing. The system employs **Word2Vec** for embedding generation, **TF-IDF** for text-based recommendations, **FAISS** for efficient similarity searches, and **Milvus** for scalable vector storage. The recommendation model considers both the **user’s profile context** and **query intent** to provide optimal suggestions.

---
## **Dataset Handling**
The dataset is loaded from Hugging Face and processed as follows:

- **Detect Text Features Dynamically**: Identifies text-based fields in the dataset.
- **Convert Textual Data to Numerical Representations**: Using Word2Vec and TF-IDF.
- **Filter Out Synthetic Users**: Ensures real users are used in recommendations.

```python
# Load dataset from Hugging Face
dataset = load_dataset("ilsilfverskiold/linkedin_profiles_synthetic")
df = pd.DataFrame(dataset['train'])

# Detect Text Features Dynamically
def detect_text_features(df):
    return [col for col in df.columns if df[col].dtype == 'object']

text_features = detect_text_features(df)
```

---
## **Feature Extraction & Embedding Generation**

### **Word2Vec for Embeddings**
Each **text feature** (e.g., Skills, Experience, Education) is transformed into a numerical vector:

```python
# Generate Word2Vec embeddings dynamically
def generate_word2vec_embeddings(df, feature):
    sentences = df[feature].dropna().apply(lambda x: x.split(", ") if isinstance(x, str) else [])
    model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)
    df[f'{feature}_embedding'] = sentences.apply(lambda words: np.mean([model.wv[w] for w in words if w in model.wv] or [np.zeros(100)], axis=0))
    return df, model
```

**Combining All Embeddings**:
```python
def combine_embeddings(row):
    embeddings = [row[f'{feature}_embedding'] for feature in text_features if f'{feature}_embedding' in row]
    return np.mean(embeddings, axis=0)

df['combined_embedding'] = df.apply(combine_embeddings, axis=1)
```

**Mathematical Explanation**:
Each text-based feature is converted into a vector **E** of dimension **d** (100 in this case). The final embedding **E_final** is:

\[ E_{final} = \frac{1}{n} \sum_{i=1}^{n} E_i \]

where **n** is the number of features being combined.

---
## **Vector Storage & Retrieval**

### **FAISS for Efficient Similarity Search**
FAISS is used to store and search user embeddings efficiently:
```python
# Normalize embeddings
all_embeddings = np.stack(df['combined_embedding'].values)
all_embeddings = normalize(all_embeddings)

# FAISS Index for real user search
index_real = faiss.IndexFlatL2(all_embeddings.shape[1])
index_real.add(all_embeddings)
```
FAISS calculates **L2 (Euclidean) distance** between embeddings:
\[ d(A, B) = \sqrt{\sum (A_i - B_i)^2} \]
where **A, B** are two embeddings.

### **Milvus for Scalable Vector Storage**
Milvus is used for storing and retrieving large-scale vectors in real time.
```python
if not utility.has_collection("user_embeddings"):
    collection = Collection("user_embeddings", fields=[
        {"name": "id", "dtype": DataType.INT64, "is_primary": True},
        {"name": "embedding", "dtype": DataType.FLOAT_VECTOR, "params": {"dim": 100}}
    ])
    collection.insert([[i for i in range(len(df))], all_embeddings.tolist()])
```

---
## **Context-Aware Recommendation System**

### **Query Understanding**
The system understands a user's intent by analyzing input queries. It assigns importance to different parts of a user’s query and matches it with similar profiles.

### **TF-IDF for Text-Based Matching**
TF-IDF is used to analyze textual similarity for user queries:
```python
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df[text_features].fillna('').agg(' '.join, axis=1))
```
TF-IDF formula:
\[ TF-IDF = TF \times IDF \]
where:
- **Term Frequency (TF)**: \( \frac{\text{No. of occurrences of word in a document}}{\text{Total words in document}} \)
- **Inverse Document Frequency (IDF)**: \( \log\frac{\text{Total number of documents}}{\text{No. of documents containing word}} \)

### **Retrieving Similar Users**
```python
def get_top_matches(user_idx, top_n=5):
    query_embedding = all_embeddings[user_idx].reshape(1, -1)
    distances, indices = index_real.search(query_embedding, top_n + 1)
    return df.iloc[indices[0][1:]][['FirstName', 'LastName', 'Headline']]
```

### **Hybrid Recommendation System**
The final recommendations combine **semantic embeddings (Word2Vec)** and **text-based similarity (TF-IDF)**.

```python
def print_combined_recommendations(user_idx, user_name, top_n=5):
    print(f"Recommendations for {user_name}:")
    print("\nContent-Based Recommendations:")
    print(get_top_matches(user_idx, top_n))
    print("\nText-Based Recommendations:")
    print(get_text_similarity_recommendations(user_idx, top_n))
```

---
## **Conclusion**
This system provides a **context-aware, scalable, and real-time recommendation model** that integrates **deep text analysis**, **semantic embeddings**, and **vector search**. Future improvements include:
- Fine-tuning **embeddings** with **real-world user data**.
- Adapting the system for **personalized recommendations** based on user feedback.
- **Deploying** this model with **FastAPI** for production use.

---
## **Next Steps**
1. **Train the model on real-world data from MongoDB**
2. **Integrate FastAPI for live recommendations**
3. **Improve personalization using reinforcement learning techniques**

