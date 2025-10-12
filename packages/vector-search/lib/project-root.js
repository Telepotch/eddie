import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Find the Eddie project root by searching upward for .system directory
 * @param {string} startDir - Directory to start searching from (defaults to cwd)
 * @returns {string} - Absolute path to project root
 * @throws {Error} - If project root cannot be found
 */
export function findProjectRoot(startDir = process.cwd()) {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const systemPath = path.join(currentDir, '.system');

    if (fs.existsSync(systemPath) && fs.statSync(systemPath).isDirectory()) {
      return currentDir;
    }

    currentDir = path.dirname(currentDir);
  }

  throw new Error(
    'Eddie project root not found. ' +
    'Make sure you are running this command from within an Eddie project directory. ' +
    'Looking for a .system/ directory marker.'
  );
}

/**
 * Get the vector data directory path
 * @param {string} projectRoot - Project root path
 * @returns {string} - Absolute path to vector data directory
 */
export function getVectorDataDir(projectRoot) {
  return path.join(projectRoot, '.system', 'vector-data');
}

/**
 * Get the publish directory path (where documentation lives)
 * @param {string} projectRoot - Project root path
 * @returns {string} - Absolute path to publish directory
 */
export function getPublishDir(projectRoot) {
  return path.join(projectRoot, 'edit', '4.publish📚');
}

/**
 * Ensure vector data directory exists
 * @param {string} projectRoot - Project root path
 */
export async function ensureVectorDataDir(projectRoot) {
  const vectorDataDir = getVectorDataDir(projectRoot);

  if (!fs.existsSync(vectorDataDir)) {
    await fs.promises.mkdir(vectorDataDir, { recursive: true });
  }

  return vectorDataDir;
}
