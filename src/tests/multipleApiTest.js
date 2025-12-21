import http from 'k6/http';
import { sleep, check } from 'k6';

/**
 * This test sends requests using a DIFFERENT API KEY each time.
 *
 * Since rate limiting is applied PER API KEY,
 * every request should be treated as a new client.
 *
 * EXPECTED RESULT:
 * - All responses should return 200
 * - 429 SHOULD NOT occur
 */

export const options = {
  vus: 1,
  iterations: 200,
};

export default function () {
  // Generate a unique API key per request
  const randomKey = `fake-key-${Math.random()}`;

  const res = http.get('http://localhost:3000/', {
    headers: {
      'x-api-key': randomKey,
    },
  });

  // Validate status code
  check(res, {
    'status is 200 (no rate limit expected)': (r) => r.status === 200,
  });

  sleep(0.1);
}
