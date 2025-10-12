#!/usr/bin/env node
// 差分インデックス化 - 変更されたファイルのみ更新

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { SimpleVectorStore } from '../lib/vector-store.js';
import { findProjectRoot, getVectorDataDir, getPublishDir, ensureVectorDataDir } from '../lib/project-root.js';

async function getFileMTime(filePath) {
  const stats = await fs.stat(filePath);
  return stats.mtimeMs;
}

async function loadIndexMeta(metaPath) {
  try {
    const data = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {}; // 初回は空
  }
}

async function saveIndexMeta(metaPath, meta) {
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
}

function chunkText(text, maxChars = 6000) {
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChars && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

async function incrementalReindex() {
  console.log('🔄 差分インデックス化開始...\n');

  try {
    // Find project root
    const projectRoot = findProjectRoot();
    const vectorDataDir = await ensureVectorDataDir(projectRoot);
    const publishDir = getPublishDir(projectRoot);
    const vectorStorePath = path.join(vectorDataDir, 'vector_store.json');
    const indexMetaPath = path.join(vectorDataDir, 'index_meta.json');

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
      console.error('   Please set it in your .env file');
      process.exit(1);
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const vectorStore = new SimpleVectorStore(vectorStorePath);
    await vectorStore.load();

    // インデックスメタ情報をロード
    const indexMeta = await loadIndexMeta(indexMetaPath);

    // 全mdファイルを取得（publish📚フォルダのみ）
    const mdFiles = await glob('**/*.md', {
      cwd: publishDir,
      absolute: true,
    });

    console.log(`📁 ${mdFiles.length}ファイル見つかりました（${publishDir}）\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let newCount = 0;
    let deletedCount = 0;

    // 既存のインデックスファイルリスト
    const currentFiles = new Set(mdFiles.map(f => path.relative(publishDir, f)));
    const indexedFiles = new Set(Object.keys(indexMeta));

    // 削除されたファイルをインデックスから削除
    for (const relPath of indexedFiles) {
      if (!currentFiles.has(relPath)) {
        console.log(`🗑️  削除: ${relPath}`);
        const chunks = indexMeta[relPath].chunks;
        for (let i = 0; i < chunks; i++) {
          await vectorStore.delete(`${relPath}:chunk:${i}`);
        }
        delete indexMeta[relPath];
        deletedCount++;
      }
    }

    // ファイルをチェック＆インデックス
    for (const filePath of mdFiles) {
      const relPath = path.relative(publishDir, filePath);
      const filename = path.basename(filePath);
      const currentMtime = await getFileMTime(filePath);

      // 既にインデックス済みで変更されていない場合はスキップ
      if (indexMeta[relPath] && indexMeta[relPath].mtime === currentMtime) {
        skippedCount++;
        continue;
      }

      const isNew = !indexMeta[relPath];
      const action = isNew ? '📝 新規' : '🔄 更新';
      console.log(`${action}: ${relPath}`);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const chunks = chunkText(content);

        // 既存のチャンクを削除
        if (indexMeta[relPath]) {
          const oldChunks = indexMeta[relPath].chunks;
          for (let i = 0; i < oldChunks; i++) {
            await vectorStore.delete(`${relPath}:chunk:${i}`);
          }
        }

        // 新しいチャンクをインデックス化
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: chunk,
          });
          const embedding = response.data[0].embedding;

          await vectorStore.add(
            `${relPath}:chunk:${i}`,
            embedding,
            chunk,
            {
              filename,
              path: relPath,
              chunk_index: i,
              total_chunks: chunks.length,
            }
          );
        }

        // メタ情報を更新
        indexMeta[relPath] = {
          mtime: currentMtime,
          chunks: chunks.length,
          indexed_at: new Date().toISOString(),
        };

        if (isNew) {
          newCount++;
        } else {
          updatedCount++;
        }
      } catch (error) {
        console.error(`   ❌ エラー: ${error.message}`);
      }
    }

    // メタ情報を保存
    await saveIndexMeta(indexMetaPath, indexMeta);

    console.log('\n✅ 完了\n');
    console.log(`📊 統計:`);
    console.log(`   新規: ${newCount}ファイル`);
    console.log(`   更新: ${updatedCount}ファイル`);
    console.log(`   削除: ${deletedCount}ファイル`);
    console.log(`   スキップ: ${skippedCount}ファイル`);
    console.log(`   合計: ${mdFiles.length}ファイル\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

incrementalReindex().catch(console.error);
