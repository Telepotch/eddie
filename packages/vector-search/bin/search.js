#!/usr/bin/env node
import OpenAI from 'openai';
import path from 'path';
import { SimpleVectorStore } from '../lib/vector-store.js';
import { findProjectRoot, getVectorDataDir } from '../lib/project-root.js';

async function search(query, nResults = 5) {
  try {
    // Find project root
    const projectRoot = findProjectRoot();
    const vectorDataDir = getVectorDataDir(projectRoot);
    const vectorStorePath = path.join(vectorDataDir, 'vector_store.json');

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
      console.error('   Please set it in your .env file');
      process.exit(1);
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const vectorStore = new SimpleVectorStore(vectorStorePath);

    await vectorStore.load();

    const count = await vectorStore.count();
    if (count === 0) {
      console.log('⚠️  Vector store is empty. Please run `eddie-reindex` first.');
      process.exit(0);
    }

    // Generate query embedding
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const queryEmbedding = response.data[0].embedding;

    // Search
    const results = await vectorStore.query(queryEmbedding, nResults);

    console.log(`\n🔍 検索クエリ: "${query}"\n`);
    console.log(`📊 結果: ${results.length}件\n`);
    console.log('─'.repeat(80));

    results.forEach((result, idx) => {
      console.log(`\n${idx + 1}. ${result.metadata.filename}`);
      console.log(`   パス: ${result.metadata.path}`);
      console.log(`   類似度: ${(result.similarity * 100).toFixed(2)}%`);
      if (result.metadata.total_chunks > 1) {
        console.log(`   チャンク: ${result.metadata.chunk_index + 1}/${result.metadata.total_chunks}`);
      }
      console.log(`\n   プレビュー:`);
      console.log(`   ${result.document.substring(0, 200).replace(/\n/g, '\n   ')}...`);
    });

    console.log('\n' + '─'.repeat(80) + '\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const query = process.argv[2];

if (!query) {
  console.log('Usage: eddie-search "your search query"');
  console.log('\nExample:');
  console.log('  eddie-search "クエスト駆動設計"');
  process.exit(1);
}

search(query).catch(console.error);
