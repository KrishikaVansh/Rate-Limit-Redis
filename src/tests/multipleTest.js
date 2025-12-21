import http from 'k6/http';
import { sleep, check } from 'k6';

/**
 * This test simulates requests coming from MULTIPLE DIFFERENT IP ADDRESSES.
 *
 * Since each request appears to come from a different IP,
 * the rate limiter should treat them as separate clients.
 *
 * EXPECTED RESULT:
 * - All requests should return 200
 * - 429 SHOULD NOT occur because limits are per-IP
 */

const ips = [
  '1.1.1.1',
  '2.2.2.2',
  '3.3.3.3',
  '4.4.4.4',
  '5.5.5.5',
];

export const options = {
  vus: 1,
  iterations: ips.length * 3, // each IP used multiple times
};

export default function () {
  // Pick a random IP for each request
  const ip = ips[Math.floor(Math.random() * ips.length)];

  const res = http.get('http://localhost:3000/', {
    headers: {
      // Simulate client IP via reverse proxy
      'X-Forwarded-For': ip,
    },
  });

  // Status code validation
  check(res, {
    'status is 200 (no rate limit expected)': (r) => r.status === 200,
  });

  sleep(0.2);
}
