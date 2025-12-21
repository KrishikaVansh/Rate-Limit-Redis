import http from 'k6/http';
import { sleep, check } from 'k6';

/**
 * This test sends sustained traffic using a SINGLE API KEY.
 *
 * Since rate limiting is applied per API key,
 * this key will quickly exceed the allowed request limit.
 *
 * EXPECTED RESULT:
 * - Initial requests return 200
 * - Once the limit is exceeded, responses return 429
 *
 * NOTE:
 * - Comment out the `x-api-key` header to test IP-based rate limiting instead.
 */

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // ramp up users
    { duration: '1m', target: 100 },  // sustained load
    { duration: '20s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // performance SLA
  },
};

const BASE_URL = 'http://localhost:3000/';
const API_KEY = 'ABC123';

export default function () {
  const res = http.get(BASE_URL, {
    headers: {
      // Same API key used for all requests
      'x-api-key': API_KEY,  // comment this line to test IP-based limiting
    },
  });

  // Validate response status
  check(res, {
    'status is 200 or 429 (API key rate limit expected)': (r) =>
      r.status === 200 || r.status === 429,
  });

  sleep(1);
}
