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
});
