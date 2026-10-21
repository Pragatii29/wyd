// Run with: npm run test:fallback
import { test } from "node:test";
import assert from "node:assert/strict";
import { fallbackWyd, type Verdict } from "./fallback.ts";

const cases: [string, Verdict, string[]][] = [
  ["Evening walk at Cubbon Park, 6pm?", "safe", ["walking"]],
  ["Anyone up for chai at a tapri near Indiranagar metro?", "safe", ["chai"]],
  ["Catching the 9pm show at PVR Orion, need company", "safe", ["movies"]],
  ["Trek to Nandi Hills this Sunday sunrise, have 2 seats", "safe", ["trekking"]],
  ["Pub crawl on Church Street tonight, who's in?", "safe", ["nightlife"]],
  ["Looking for a hookup tonight", "unsafe", []],
  ["Need someone to send money on UPI, will return", "unsafe", []],
  ["Board games at #42, 5th cross Koramangala", "unsafe", []],
  ["Come alone to my place for drinks", "review", []],
  ["Late night only, no questions asked", "review", []],
];

for (const [text, verdict, tags] of cases) {
  test(`${verdict}: ${text}`, () => {
    const result = fallbackWyd(text);
    assert.equal(result.verdict, verdict, result.reason);
    for (const tag of tags) assert.ok(result.tags.includes(tag as never), `missing tag ${tag} in ${result.tags}`);
    assert.ok(result.tags.length <= 3);
  });
}
