# 2. Camera ingredient checklist and cooking verification

**Idea (a):** point the camera at the counter; FitPlate ticks off the ingredients it recognises. **Idea (b):** check a cooking step ("onions golden brown?") from a photo.

## Options for the vision model
| Option | Cost | Works offline | Notes |
|---|---|---|---|
| On-device general labeller (Google ML Kit image labelling, Apple Vision) | free | yes | Generic labels ("food", "vegetable"); not accurate enough for specific Indian ingredients such as "methi" or "toor dal". |
| On-device custom model (TensorFlow Lite or Core ML, trained on a food dataset such as Food-101 or Indian-food sets) | free to run, effort to train | yes | Needs training data and a native build; accuracy on mixed countertops is modest. |
| Cloud vision API (a general multimodal model) | pay per image | no | Much better at naming ingredients and judging doneness. Needs a server in between (no keys in the app), a daily cap, and the person's consent to send the photo. |

## Feasibility
- **Ingredient checklist:** realistic only as "suggest, then person confirms". A tick the person can correct is useful; an automatic tick is wrong too often. Pantry list entry by typing already works.
- **Cooking verification:** doneness (colour, texture) is hard for small models and subjective for people. Safer framing: a **comparison photo** (show what "golden" looks like next to the person's pan) with no automatic verdict.
- **Food safety:** never use vision to say meat or leftovers are safe to eat. Keep the existing time-based rules.
- **Privacy:** photos of kitchens can include faces and documents. Process on device where possible; for cloud, send once, store nothing, and say so.
- **Existing work:** the camera mode (Day 26) already opens the camera and records clips on the phone, and the `PoseProvider` slot exists for later models.

## Recommendation
Do not build automatic verification. Build, in this order: (1) comparison photos in cook steps (needs the video and photo work in doc 3); (2) an optional "scan my counter" that uses a cloud multimodal model behind the existing hosted server, with a daily cap and a confirm-each-item step, only after the hosted server decision is made.

## Decisions for Sudarsan
- Accept a small per-photo cost (it would be capped), or stay fully on-device and free?
- Is "suggest then confirm" good enough for the ingredient checklist?
- Hosted server choice (Oracle VM or Cloudflare), since the cloud option depends on it.
