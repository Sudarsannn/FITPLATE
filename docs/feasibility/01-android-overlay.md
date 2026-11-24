# 1. Swiggy / Zomato checkout overlay on Android

**Idea:** while the person is on the Swiggy or Zomato checkout screen, FitPlate shows a small panel: calories, the cook-at-home cost, and a "cook instead" button.

## What it would take
- **Draw over other apps:** the "display over other apps" permission (`SYSTEM_ALERT_WINDOW`), granted by the person in system settings. Needs a native module (not available in Expo Go; an EAS dev build is enough).
- **Know which screen is showing:** either the Usage Access permission (which app is in front) or an **Accessibility Service**. Reading the cart contents (to show the actual dish) needs the Accessibility Service, which can read on-screen text.
- **Run in the background:** a foreground service with a visible notification.

## Risks
- **Google Play policy:** Accessibility Services are restricted to apps that genuinely help people with disabilities; using one to read other apps' screens for a shopping or health overlay is the kind of use Play usually rejects, and it needs a declaration form and a justification video. Overlays that cover another app's purchase buttons are also scrutinised. **Check the current Play "AccessibilityService API" and "Permissions" policies before building.**
- **Terms of service:** Swiggy and Zomato's terms usually forbid automated reading of their app. They could block it, and the person might see their account flagged.
- **Fragility:** the screen text changes with every app update, so the reader would break often.
- **iOS:** not possible. iOS does not allow drawing over other apps or reading their screens. The nearest options are a share extension, a widget, or a Shortcut.
- **Privacy:** reading a checkout screen means reading addresses and payment hints; it would need strict on-device-only handling and clear consent.

## Options, safest first
1. **What exists now:** "Order instead" and "Analyse my Swiggy checkout" (paste or share the order text), plus the official Swiggy MCP route on Sudarsan's Mac only. No special permissions.
2. **Share target (Android and iOS):** the person shares the Swiggy order or menu text into FitPlate; FitPlate answers with calories and the cook-at-home cost. Low risk, works on both phones.
3. **Overlay without reading the screen:** a floating "Cook instead?" bubble the person turns on themselves, with no screen reading. Medium risk (overlay permission only). Sideload or Play, with a clear explanation.
4. **Overlay with screen reading (Accessibility Service):** the original idea. High risk for rejection and for being blocked.

## Recommendation
Build option 2 first (a share target) and keep option 4 as a feasibility test only: a sideloaded APK on Sudarsan's own phone, never published, to learn whether the screen text is readable. Apply to Swiggy's Builders Club (still undecided) before anything public; an official data route beats screen reading.

## Decisions for Sudarsan
- Is a sideloaded, personal-use test acceptable (not for the Play Store)?
- Apply to the Swiggy Builders Club, yes or no?
- Android first for any native test (the EAS APK guide is still waiting for your yes or no)?
