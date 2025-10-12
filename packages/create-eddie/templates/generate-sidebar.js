import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトルートを取得（.systemの親ディレクトリ）
const projectRoot = path.resolve(__dirname, '../..');
const sidebarOrderPath = path.join(projectRoot, 'edit/4.publish📚/sidebar-order.json');

// sidebar-order.json を読み込み
if (!fs.existsSync(sidebarOrderPath)) {
  console.error('❌ sidebar-order.json not found at:', sidebarOrderPath);
  process.exit(1);
}

const sidebarOrder = JSON.parse(fs.readFileSync(sidebarOrderPath, 'utf-8'));

// VitePress sidebar 形式に変換
const sidebar = sidebarOrder.groups.map(group => ({
  text: group.text,
  items: group.items.map(item => ({
    text: item.text,
    link: item.file === 'index' ? '/' : `/${item.file}`
  }))
}));

// sidebar.json として出力
const outputPath = path.join(__dirname, 'sidebar.json');
fs.writeFileSync(outputPath, JSON.stringify(sidebar, null, 2));

console.log('✅ Sidebar generated:', outputPath);
console.log(`📊 ${sidebar.length} groups, ${sidebar.reduce((sum, g) => sum + g.items.length, 0)} items`);
