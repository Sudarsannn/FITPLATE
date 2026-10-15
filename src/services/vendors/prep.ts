/** "Cook while it arrives": what to do at each point of the delivery ETA. */
export function prepTimeline(etaMin: number | null, equipment: string[]): { at: string; text: string; now: boolean }[] {
  const eta = etaMin ?? 12;
  const kit = equipment.slice(0, 4).join(', ');
  return [
    { at: 'Now', text: kit ? `Get out what you’ll need: ${kit}.` : 'Get out your pan, knife and chopping board.', now: eta > 5 },
    { at: '5 min before', text: 'Clear the counter and wash your hands.', now: eta <= 5 && eta > 0 },
    { at: 'When it arrives', text: 'Check the items against your list, then start chopping.', now: eta === 0 },
  ];
}

