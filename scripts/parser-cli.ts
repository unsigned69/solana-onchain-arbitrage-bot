#!/usr/bin/env ts-node
import { fetchCandidates } from '../lib/parser/fetch-candidates.js';
import { formatCandidatesTable, writeCandidateConfig } from '../lib/config/candidate-config-writer.js';

interface CliOptions {
  filters?: unknown;
  writeConfig: boolean;
  dryValidate: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { writeConfig: false, dryValidate: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--filters') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('Ожидали JSON после --filters');
      }
      options.filters = JSON.parse(value);
      index += 1;
      continue;
    }
    if (arg === '--write-config') {
      options.writeConfig = true;
      continue;
    }
    if (arg === '--dry-validate') {
      options.dryValidate = true;
      continue;
    }
  }
  return options;
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await fetchCandidates(options.filters as Record<string, unknown> | undefined);
    console.log(`Найдено кандидатов: ${result.candidates.length} (адаптеров: ${result.adapterCount})`);
    formatCandidatesTable(result.candidates);
    if (options.writeConfig) {
      writeCandidateConfig(result, { dryValidate: options.dryValidate });
    } else if (options.dryValidate) {
      console.log('Режим dry-validate активен, конфигурация не изменена.');
    }
  } catch (error) {
    console.error('Ошибка во время работы parser-cli:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
