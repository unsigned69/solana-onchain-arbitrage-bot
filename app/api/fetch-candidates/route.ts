import { fetchCandidates, BaseAnchorNotFoundError, CandidateFilters } from '../../../lib/parser/fetch-candidates';

// NOTE: этот роут независим от статуса процесса бота; не импортировать runner.
export async function POST(request: Request): Promise<Response> {
  let filters: CandidateFilters | undefined;
  try {
    const payload = await request.json();
    if (payload && typeof payload === 'object' && 'filters' in payload) {
      filters = (payload as { filters?: CandidateFilters }).filters;
    } else {
      filters = payload as CandidateFilters | undefined;
    }
  } catch (error) {
    filters = undefined;
  }

  try {
    const result = await fetchCandidates(filters);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'content-type': 'application/json'
      }
    });
  } catch (error) {
    if (error instanceof BaseAnchorNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          'content-type': 'application/json'
        }
      });
    }
    console.error('Unexpected error while fetching candidates', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
}
