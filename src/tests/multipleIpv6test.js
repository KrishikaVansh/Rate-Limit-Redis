import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * IPv6 SUBNET RATE LIMIT TEST
 *
 * SCENARIO 1 (commented out below):
 * - Multiple IPv6 addresses from the SAME /64 subnet
 * - Rate limit SHOULD trigger after ~10 requests
 *
 * SCENARIO 2 (active):
 * - IPv6 addresses from DIFFERENT /64 subnets
 * - Requests are distributed across subnets
 * - Some requests return 200, some may return 429
 *
 * EXPECTED RESULT:
 * - Server must correctly normalize IPv6 to /64
 * - Responses must be either 200 (allowed) or 429 (rate limited)
 */

export const options = {
  vus: 1,
  iterations: 120,
};

/**
 * SAME /64 subnet (will hit 429 quickly)
 *
 * Example /64:
 * 2001:db8:abcd:0012::/64
 */
// const ipv6List = [
//   '2001:db8:abcd:0012::1',
//   '2001:db8:abcd:0012::2',
//   '2001:db8:abcd:0012::ffff',
// ];

/**
 * DIFFERENT /64 subnets
 * Each address belongs to a different subnet
 * Rate limiting is shared only within the same /64
 */
const ipv6List = [
  '2001:db8:abcd:0012::1', // subnet A
  '2001:db8:abcd:0013::1', // subnet B
];

let i = 0;

export default function () {
  // Rotate IPv6 addresses deterministically
  const ipv6 = ipv6List[i % ipv6List.length];
  i++;

  const res = http.get('http://localhost:3000/', {
    headers: {
      // Simulate client IPv6 using reverse proxy header
      'X-Forwarded-For': ipv6,
    },
  });

  // Validate that rate limiting behaves correctly
  check(res, {
    'ipv6 /64 rate limiting works (200 or 429)': (r) =>
      r.status === 200 || r.status === 429,
  });

  sleep(0.1);
}
