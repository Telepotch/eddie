# 🎯 Eddie プロジェクトガイド

## ⚠️ Claude Code へ: このファイルを必ず読んでください

このプロジェクトは **Eddie** (AI-Assisted Documentation Framework) で構築されています。

---

## 📄 新しいページを追加する方法

**ユーザーが「新しいページを追加して」「〇〇についてのドキュメント作成して」と言ったら:**

### ステップ1: Markdownファイル作成

`edit/4.publish📚/new-page.md` を作成

```markdown
# New Page Title

Content here...
```

### ステップ2: サイドバーに追加

`edit/4.publish📚/sidebar-order.json` を編集:

```json
{
  "groups": [
    {
      "text": "Getting Started",
      "items": [
        { "file": "index", "text": "Introduction" },
        { "file": "new-page", "text": "New Page" }
      ]
    }
  ]
}
```

**重要**:
- `"file"` には拡張子なしのファイル名
- `"text"` にはサイドバーに表示される名前
- JSON構文エラーに注意（カンマ、括弧）

### ステップ3: 確認

サイドバーは `npm run dev` または `npm run build` 時に自動生成されます。

---

## 🔍 ベクトル検索の使い方

**ユーザーが「〇〇について調べて」「〇〇を説明して」と言ったら:**

### 検索コマンド

```bash
npm run search "検索クエリ"
```

**例**:
```bash
npm run search "サイドバーの設定方法"
npm run search "ベクトル検索とは"
```

### 再インデックス

新しいドキュメントを追加したら:

```bash
npm run reindex
```

---

## 📁 ディレクトリ構造

### ユーザーが編集する場所 (`edit/`)

- **`edit/4.publish📚/`** - 最終ドキュメント（**Webサイトになる**）
  - ここのMarkdownファイルがVitePressでサイト化される
  - `sidebar-order.json` でサイドバー順序を管理

- **`edit/0.prompt🤖/`** - AIプロンプトテンプレート
  - Claude Codeへの指示書
  - 「〇〇について書いて」系のプロンプト保存

- **`edit/1.source📦/`** - 原材料
  - ミーティング議事録、トランスクリプト
  - コピペしたメモ、スクリーンショット
  - 未整理のまま保存OK

- **`edit/2.sampling✂️/`** - 抽出・精製コンテンツ
  - 1.source から重要部分を抜粋
  - 箇条書き、キーポイント
  - まだ文章にはなっていない

- **`edit/3.plot📋/`** - アウトライン
  - ドキュメントの構成案
  - 見出しリスト
  - 内部リンク計画

- **`edit/archive🗑️/`** - アーカイブ
  - 使わなくなったコンテンツ
  - 削除せず保管

### バックエンド (`.system/`) - **触らない**

- `.system/site-config/` - VitePress設定
- `.system/vector-data/` - ベクトル検索データ
- `.system/claude/` - Claude Code設定

---

## 🎨 Eddie ワークフロー

```
0.prompt🤖  → AIにプロンプト
              ↓
1.source📦  → 原材料を収集
              ↓
2.sampling✂️ → 重要部分を抽出
              ↓
3.plot📋    → 構成を計画
              ↓
4.publish📚 → 最終ドキュメント → Web公開
              ↓
archive🗑️   → 不要なものを保管
```

**推奨**: 順番に進める必要はない。4.publishに直接書いてもOK。

---

## 🔗 Obsidian Wikilinks

Eddie は Obsidian のWikilink記法に対応:

```markdown
[[ページ名]]
[[ページ名|表示テキスト]]
[[ページ名#見出し]]
```

VitePressが自動で変換します。

---

## 🚀 開発・ビルドコマンド

```bash
npm run dev         # 開発サーバー起動 (http://localhost:5173)
npm run build       # 本番ビルド
npm run preview     # ビルド結果をプレビュー

npm run search "query"   # ベクトル検索
npm run reindex          # 再インデックス

npm run generate-sidebar # サイドバー生成（通常は自動実行）
```

---

## 📝 Git Commit 推奨フォーマット

```bash
git commit -m "docs: 〇〇ページを追加

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## ⚠️ 重要な注意点

1. **sidebar-order.json はJSON**
   - 構文エラーがあるとビルドが失敗
   - カンマ忘れ、括弧の対応に注意
   - 編集後に `npm run dev` で確認

2. **ページ追加の2ステップ**
   - `.md` ファイル作成
   - `sidebar-order.json` 更新
   - 両方やらないとサイドバーに表示されない

3. **ベクトル検索の再インデックス**
   - 新しいファイル追加時は `npm run reindex` を実行
   - 検索結果に反映させるため

4. **プロジェクトルート検出**
   - Eddieは `.system/` ディレクトリで自身を認識
   - このディレクトリがある場所がプロジェクトルート

---

**このファイルの存在を忘れないでください。新しいセッションでもこの指示に従ってください。**
