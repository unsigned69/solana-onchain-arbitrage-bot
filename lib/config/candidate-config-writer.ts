import fs from 'fs';
import path from 'path';
import { CandidateToken, FetchCandidatesResult } from '../parser/fetch-candidates';

interface WriteOptions {
  dryValidate?: boolean;
}

function getOutputPath(): string {
  const configured = process.env.BOT_CONFIG_PATH;
  if (configured && configured.trim().length > 0) {
    return path.resolve(process.cwd(), configured);
  }
  return path.resolve(process.cwd(), './config/token-picker.json');
}

function serialise(result: FetchCandidatesResult): string {
  const payload = {
    tokens: result.pair,
    candidates: result.candidates
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function ensureBackup(targetPath: string, existingContent: string): string | null {
  const dir = path.dirname(targetPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(dir, `token-picker.backup-${timestamp}.json`);
  fs.writeFileSync(backupPath, existingContent, 'utf8');
  return backupPath;
}

function printDiff(previous: string, nextValue: string): void {
  const prevLines = previous.split('\n');
  const nextLines = nextValue.split('\n');
  const maxLength = Math.max(prevLines.length, nextLines.length);
  console.log('Diff предварительного просмотра:');
  for (let index = 0; index < maxLength; index += 1) {
    const prevLine = prevLines[index];
    const nextLine = nextLines[index];
    if (prevLine === nextLine) {
      continue;
    }
    if (prevLine !== undefined) {
      console.log(`- ${prevLine}`);
    }
    if (nextLine !== undefined) {
      console.log(`+ ${nextLine}`);
    }
  }
}

export function writeCandidateConfig(result: FetchCandidatesResult, options: WriteOptions = {}): void {
  const outputPath = getOutputPath();
  const serialised = serialise(result);
  let previous = '';

  if (fs.existsSync(outputPath)) {
    previous = fs.readFileSync(outputPath, 'utf8');
    printDiff(previous, serialised);
    if (options.dryValidate) {
      console.log('Режим dry-validate: файл не перезаписан.');
      return;
    }
    const backupPath = ensureBackup(outputPath, previous);
    console.log(`Создан backup конфигурации: ${backupPath}`);
  } else if (options.dryValidate) {
    console.log('Режим dry-validate: файл отсутствует, запись пропущена.');
    return;
  }

  fs.writeFileSync(outputPath, serialised, 'utf8');
  console.log(`Конфигурация кандидатов обновлена: ${outputPath}`);
}

export function formatCandidatesTable(candidates: CandidateToken[]): void {
  if (candidates.length === 0) {
    console.log('Кандидаты не найдены.');
    return;
  }
  console.table(
    candidates.map((candidate) => ({
      symbol: candidate.symbol,
      address: candidate.address,
      liquidity: candidate.liquidity,
      source: candidate.source,
      updatedAt: candidate.updatedAt
    }))
  );
}
