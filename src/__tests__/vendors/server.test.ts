import { describe, expect, it } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tools = require('../../../server/lib/tools.cjs');

describe('local FitPlate server helpers', () => {
  it('maps the app’s argument names onto the tool’s schema', () => {
    const schema = { properties: { address_id: {}, query: {} }, required: ['address_id', 'query'] };
    expect(tools.adaptArgs({ addressId: 'a1', query: 'atta' }, schema)).toEqual({ args: { address_id: 'a1', query: 'atta' }, missing: [] });
    expect(tools.adaptArgs({ query: 'atta' }, schema).missing).toEqual(['address_id']);
    expect(tools.adaptArgs({ x: 1 }, undefined)).toEqual({ args: { x: 1 }, missing: [] });
  });

  it('reads structured content, JSON text or plain text', () => {
    expect(tools.parseToolResult({ structuredContent: { a: 1 } })).toEqual({ a: 1 });
    expect(tools.parseToolResult({ content: [{ type: 'text', text: '{"b":2}' }] })).toEqual({ b: 2 });
    expect(tools.parseToolResult({ content: [{ type: 'text', text: 'hello' }] })).toEqual({ text: 'hello' });
    expect(tools.parseToolResult(null)).toBeNull();
  });

  it('maps errors to codes', () => {
    expect(tools.errorCode({ status: 401 })).toBe('AUTH');
    expect(tools.errorCode(new Error('429 Too Many Requests'))).toBe('RATE_LIMIT');
    expect(tools.errorCode({ status: 503 })).toBe('SERVER');
    expect(tools.errorCode(new Error('boom'))).toBe('OTHER');
  });

  it('only returns the browser to FitPlate itself', () => {
    expect(tools.safeReturnUrl('http://localhost:8081/vendors')).toBe('http://localhost:8081/vendors');
    expect(tools.safeReturnUrl('fitplate://vendors')).toBe('fitplate://vendors');
    expect(tools.safeReturnUrl('https://evil.example/')).toBeNull();
    expect(tools.safeReturnUrl('not a url')).toBeNull();
  });

  it('keeps order-placing tools on the gated list', () => {
    expect([...tools.ORDER_TOOLS].sort()).toEqual(['checkout', 'confirm_order', 'place_food_order']);
  });

  it('reads a pasted Swiggy return address, a query string or a bare code', () => {
    expect(tools.parsePastedLogin('http://localhost:8787/callback?code=abc123XYZ&state=s1')).toEqual({ code: 'abc123XYZ', state: 's1' });
    expect(tools.parsePastedLogin('callback?code=abc123XYZ&state=s1')).toEqual({ code: 'abc123XYZ', state: 's1' });
    expect(tools.parsePastedLogin('  abc123XYZ-def ')).toEqual({ code: 'abc123XYZ-def', state: '' });
    expect(tools.parsePastedLogin('hello world')).toBeNull();
    expect(tools.parsePastedLogin('')).toBeNull();
  });

  it('checks the hosted access key and the allowed origins', () => {
    expect(tools.keyMatches('secret', 'secret')).toBe(true);
    expect(tools.keyMatches('secreT', 'secret')).toBe(false);
    expect(tools.keyMatches('', '')).toBe(false);
    expect(tools.originAllowed('https://fit.example.dev', 'https://fit.example.dev/, https://b.dev')).toBe(true);
    expect(tools.originAllowed('http://localhost:8081', '')).toBe(true);
    expect(tools.originAllowed('https://evil.example', 'https://fit.example.dev')).toBe(false);
  });
});
