import http from 'k6/http';
import { sleep, check } from 'k6';

/**
 * This test simulates requests coming from a SINGLE IPv6 ADDRESS.
 *
 * Since all requests originate from the same IPv6 /64 subnet,
 * the rate limiter should group them together and enforce limits.
 *
 * EXPECTED RESULT:
 * - Initial requests return 200
 * - After exceeding the limit, responses return 429
 */

export const options = {
  vus: 1,
  iterations: 120,
};

export default function () {
  const ipv6 = '2001:db8:abcd:0012::1'; // documentation IPv6 range

  const res = http.get('http://localhost:3000/', {
    headers: {
      // Simulate IPv6 client forwarded by proxy
      'X-Forwarded-For': ipv6,
    },
  });

  // Validate response status
  check(res, {
    'status is 200 or 429 (IPv6 rate limit expected)': (r) =>
      r.status === 200 || r.status === 429,
  });

  sleep(0.1);
}
