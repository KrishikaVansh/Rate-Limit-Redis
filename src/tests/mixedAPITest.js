import http from 'k6/http';
import { sleep, check } from 'k6';

/**
 * This test simulates MULTIPLE API KEYS being used concurrently.
 *
 * One API key (`real-key-1`) appears more frequently in the list,
 * so it will exceed the rate limit and receive 429 responses.
 *
 * Other API keys are used less often and should continue
 * receiving 200 responses.
 *
 * EXPECTED RESULT:
 * - Both 200 and 429 responses should appear
 */

const keys = [
  'real-key-1',
  'real-key-1', // intentionally duplicated to increase load on this key
  'fake-key-a',
  'fake-key-b',
  'fake-key-c',
];

export const options = {
  vus: 5,
  duration: '10s',
};

export default function () {
  // Randomly select an API key
  const key = keys[Math.floor(Math.random() * keys.length)];

  const res = http.get('http://localhost:3000/', {
    headers: {
      'x-api-key': key,
    },
  });

  // Validate response status
  check(res, {
    'status is 200 or 429 (mixed expected)': (r) =>
      r.status === 200 || r.status === 429,
  });

  sleep(0.1);
}
