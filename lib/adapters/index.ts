import { DexAdapter } from './dex-adapter';
import { MockDexAdapter } from './mock-adapter';

export function loadDexAdapters(): DexAdapter[] {
  // В проде сюда подключаются реальные адаптеры. Пока используем мок.
  return [new MockDexAdapter()];
}
