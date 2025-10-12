import fs from 'fs/promises';
import path from 'path';

export class SimpleVectorStore {
  constructor(storagePath) {
    this.storagePath = storagePath;
    this.documents = [];
  }

  async load() {
    try {
      const data = await fs.readFile(this.storagePath, 'utf-8');
      this.documents = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start fresh
      this.documents = [];
    }
  }

  async save() {
    await fs.writeFile(this.storagePath, JSON.stringify(this.documents, null, 2));
  }

  async add(id, embedding, document, metadata) {
    // Remove existing document with same ID
    this.documents = this.documents.filter(doc => doc.id !== id);

    this.documents.push({
      id,
      embedding,
      document,
      metadata,
    });

    await this.save();
  }

  async delete(id) {
    this.documents = this.documents.filter(doc => doc.id !== id);
    await this.save();
  }

  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  }

  async query(queryEmbedding, nResults = 5) {
    const results = this.documents.map(doc => ({
      ...doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, nResults);
  }

  async list() {
    return this.documents.map(doc => ({
      id: doc.id,
      metadata: doc.metadata,
    }));
  }

  async count() {
    return this.documents.length;
  }

  async clear() {
    this.documents = [];
    await this.save();
  }
}
