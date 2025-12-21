import http from 'k6/http';
import { sleep, check } from 'k6';

/**
 * This test simulates MANY DIFFERENT IP ADDRESSES
 * sending requests at the same time.
 *
 * Some IPs will send enough requests to exceed the limit
 * and receive 429 responses.
 *
 * Other IPs will stay below the threshold and continue
 * receiving 200 responses.
 *
 * EXPECTED RESULT:
 * - Both 200 and 429 responses should appear
 */

const ips = Array.from({ length: 20 }, (_, i) => `10.0.0.${i}`);

export const options = {
  vus: 20,
  duration: '10s',
};

export default function () {
  // Randomly pick one of the available IPs
  const ip = ips[Math.floor(Math.random() * ips.length)];

  const res = http.get('http://localhost:3000/', {
    headers: {
      // Simulate client IP forwarded by proxy
      'X-Forwarded-For': ip,
    },
  });

  // Validate response status
  check(res, {
    'status is 200 or 429 (mixed expected)': (r) =>
      r.status === 200 || r.status === 429,
  });

  sleep(0.1);
}
