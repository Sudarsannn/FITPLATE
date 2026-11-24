# 3. Real step-by-step videos

**Need:** short clips per cooking step, so a beginner can see what "golden brown" or "fold gently" looks like. The app already has a video slot in cook mode (Day 12); the login clip files are generated placeholders.

## Three sources compared
| Source | Cost (rough) | Quality | Risks |
|---|---|---|---|
| **AI-generated** video | low per clip (credits) | Looks plausible but can show wrong technique, impossible food physics or odd hands; hard to keep the same kitchen across steps | Misleading cooking or safety advice; some tools restrict commercial use; viewers may distrust it |
| **Filmed by you or a freelancer** | phone plus a tripod is free; a freelancer is a per-dish fee (get quotes; budget a few thousand rupees per dish) | Most trustworthy and consistent; you control technique and regional accuracy | Time per dish; needs a simple shot list; music and faces need rights |
| **Licensed or creative-commons** clips | free to a few thousand rupees per clip | Uneven; rarely match your exact step text | Licence terms (attribution, no commercial use), takedown risk; clips do not line up with steps |

(Costs are rough planning figures, not quotes.)

## Recommendation
- **Film the top 10 dishes yourself** (fixed phone, overhead, one 5 to 10 second clip per key step, no talking, no music). That is about 50 to 80 short clips. Keep them tiny (under 1 MB each, 720p) so they can ship in the app or load from cheap storage.
- Use **AI video only for the login background and mood clips**, not for instruction.
- Use licensed clips only for gaps, and record each licence in `docs/` next to the photo credits.
- App side: the video slot already exists; the dish data only needs a list of clip names per step. A small build day can wire the file names in.

## Decisions for Sudarsan
- Who films: you, a friend or a freelancer?
- Which 10 dishes first (the most-cooked in the app is a good default)?
- Where clips live: bundled in the app (bigger download) or in free cloud storage (needs the hosting decision)?
