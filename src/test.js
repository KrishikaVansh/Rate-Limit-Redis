import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // ramp up
    { duration: '1m', target: 100},  // sustain load
    { duration: '20s', target: 0 },  // ramp down
  ],
  thresholds: {
    
    http_req_duration: ['p(95)<500'], // 95% < 500ms
  },
};

const BASE_URL = 'http://localhost:3000/';
const API_KEY = 'ABC123';

export default function () {
  const res = http.get(BASE_URL, {
    headers: {
      'x-api-key': API_KEY,   //  comment this to test IP-based limiting
    },
  });

  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
  });

  sleep(1);
}
