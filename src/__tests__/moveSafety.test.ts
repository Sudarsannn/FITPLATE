import { describe, expect, it } from '@jest/globals';

import { moveFit, userConcerns } from '../services/moveSafety';

const e = (cc: { condition: string; status: 'ok' | 'modify' | 'avoid' | 'ask_doctor'; change?: string }[]) => ({ conditionCautions: cc.map((c) => ({ change: 'x', source: 's', ...c })) });

describe('moveSafety', () => {
  it('maps limits and health answers, and lists answers with no research rule', () => {
    const r = userConcerns({ limits: ['Knees', 'Wrists', 'Pregnancy or after birth'], healthIssues: ['hypertension', 'none'] });
    expect(r.concerns.map((c) => c.condition).sort()).toEqual(['hypertension', 'knee_pain', 'postpartum', 'pregnancy']);
    expect(r.unresearched).toEqual(['wrists']);
  });
  it('takes the worst status and reports modifications', () => {
    const { concerns } = userConcerns({ limits: ['Knees', 'Pregnancy or after birth'], healthIssues: [] });
    const m = moveFit(e([{ condition: 'knee_pain', status: 'modify', change: 'step version' }, { condition: 'pregnancy', status: 'avoid' }, { condition: 'postpartum', status: 'ok' }]), concerns);
    expect(m.fit).toBe('avoid');
    expect(m.notes.map((n) => n.label)).toEqual(['knee problem', 'pregnancy']);
  });
  it('is unknown when the research has no rule, and ok with no concerns', () => {
    expect(moveFit(e([]), userConcerns({ limits: ['Knees'], healthIssues: [] }).concerns).fit).toBe('unknown');
    expect(moveFit(e([]), []).fit).toBe('ok');
  });
});
