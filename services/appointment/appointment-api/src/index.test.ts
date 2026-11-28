import { serve, type HttpBindings } from '@hono/node-server';
import { expect, test, vi } from 'vitest';
import './index';

vi.mock('@hono/node-server', () => ({ serve: vi.fn() }));

test('the API index only advertises reachable endpoints', async () => {
  const [{ fetch }] = vi.mocked(serve).mock.calls[0];
  const request = (path: string) =>
    fetch(new Request(`http://localhost${path}`), {} as HttpBindings) as Promise<Response>;
  const response = await request('/');
  expect(response.status).toBe(200);
  const { endpoints } = await response.json() as { endpoints: string[] };
  expect(endpoints).toEqual(expect.arrayContaining(['/health', '/api/appointments']));
  for (const path of endpoints) {
    expect((await request(path)).status, path).toBe(200);
  }
});
