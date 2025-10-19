'use client';

import { useCallback, useMemo, useState } from 'react';

type Candidate = {
  symbol: string;
  address: string;
  liquidity: number;
  source: string;
  updatedAt: string;
};

type FetchResponse = {
  pair: {
    base: { symbol: string; address: string };
    anchor: { symbol: string; address: string };
  };
  candidates: Candidate[];
  endpoint: string;
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string; baseAnchorMissing: boolean }
  | { status: 'ready'; data: FetchResponse };

async function requestCandidates(filters: Record<string, unknown> | undefined): Promise<FetchResponse> {
  const response = await fetch('/api/fetch-candidates', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ filters })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload.error === 'string' ? payload.error : 'Не удалось получить кандидатов';
    const baseAnchorMissing = response.status === 400 && message.includes('Base/Anchor');
    throw Object.assign(new Error(message), { baseAnchorMissing });
  }
  return (await response.json()) as FetchResponse;
}

export default function TokenPickerPage() {
  const [state, setState] = useState<State>({ status: 'idle' });
  const [filters, setFilters] = useState<string>('{}');

  const disableRefresh = useMemo(() => {
    if (state.status === 'loading') {
      return true;
    }
    if (state.status === 'error') {
      return state.baseAnchorMissing;
    }
    return false;
  }, [state]);

  const handleRefresh = useCallback(async () => {
    let parsedFilters: Record<string, unknown> | undefined;
    try {
      const trimmed = filters.trim();
      parsedFilters = trimmed ? (JSON.parse(trimmed) as Record<string, unknown>) : undefined;
    } catch (error) {
      setState({ status: 'error', message: 'Некорректный JSON с фильтрами', baseAnchorMissing: false });
      return;
    }

    setState({ status: 'loading' });
    try {
      const payload = await requestCandidates(parsedFilters);
      setState({ status: 'ready', data: payload });
    } catch (error) {
      const baseAnchorMissing = Boolean((error as { baseAnchorMissing?: boolean }).baseAnchorMissing);
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setState({ status: 'error', message, baseAnchorMissing });
    }
  }, [filters]);

  const handleRowRefresh = useCallback(
    async (candidate: Candidate) => {
      setState((current) => {
        if (current.status !== 'ready') {
          return current;
        }
        const now = new Date().toISOString();
        const refreshedCandidate = { ...candidate, updatedAt: now };
        const nextCandidates = current.data.candidates.map((item) =>
          item.address === refreshedCandidate.address && item.source === refreshedCandidate.source ? refreshedCandidate : item
        );
        return { status: 'ready', data: { ...current.data, candidates: nextCandidates } };
      });
    },
    []
  );

  const renderBody = () => {
    if (state.status === 'idle') {
      return <p className="text-slate-500">Нажмите «Обновить данные», чтобы получить актуальные пары.</p>;
    }
    if (state.status === 'loading') {
      return <p className="text-slate-500">Загружаем кандидатов…</p>;
    }
    if (state.status === 'error') {
      return (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {state.message}
          {state.baseAnchorMissing && <p className="mt-2">Убедитесь, что base/anchor заданы в конфиге.</p>}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded border border-slate-200 p-3 text-sm text-slate-600">
          <p>
            Используемый RPC: <strong>{state.data.endpoint}</strong>
          </p>
          <p>
            Пара: {state.data.pair.base.symbol} ↔ {state.data.pair.anchor.symbol}
          </p>
        </div>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Пара</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Ликвидность</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Источник</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Обновлено</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.data.candidates.map((candidate) => (
              <tr key={`${candidate.address}-${candidate.source}`}>
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-800">{candidate.symbol}</div>
                  <div className="text-xs text-slate-500">{candidate.address}</div>
                </td>
                <td className="px-3 py-2">{candidate.liquidity.toLocaleString('ru-RU')}</td>
                <td className="px-3 py-2">{candidate.source}</td>
                <td className="px-3 py-2">{new Date(candidate.updatedAt).toLocaleTimeString()}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    onClick={() => handleRowRefresh(candidate)}
                  >
                    ↻ Обновить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const banner = state.status === 'error' && state.baseAnchorMissing && (
    <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
      Base/Anchor токены не найдены в конфиге. Добавьте их в файл конфигурации и повторите попытку.
    </div>
  );

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-800">Подбор токенов</h1>
        <p className="text-sm text-slate-500">Парсер работает независимо от процесса бота. Запуск бота не обязателен.</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={handleRefresh}
            disabled={disableRefresh}
          >
            Обновить данные
          </button>
          <label className="flex flex-1 items-center gap-2 text-sm text-slate-600">
            <span>Фильтры (JSON):</span>
            <textarea
              className="flex-1 rounded border border-slate-300 p-2 text-xs font-mono"
              rows={3}
              value={filters}
              onChange={(event) => setFilters(event.target.value)}
            />
          </label>
        </div>
      </header>
      {banner}
      {renderBody()}
    </section>
  );
}
