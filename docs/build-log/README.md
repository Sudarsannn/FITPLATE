# FitPlate build log

Every daily build file (`FitPlate_Build_DayNN_YYYY-MM-DD.md`) is copied here so the history lives in the repo as well as in the project's shared folder. Each file holds that day's summary, data sync report, innovation, database notes, how to test and the cumulative BUILD STATE (roadmap, ideas backlog, feature flags).

## Decisions and changes outside the daily builds

- **28 Oct 2026, Day 11 (`ff8730c`):** cook mode keep-awake, resume and timer alarm; Cook again and Recently viewed rows; balance screen respects injuries and conditions (`src/services/moveSafety.ts`).
- **28 Oct 2026, Swiggy off the Mac:** the splitwise repo (Venkatesh2304/splitwise) was reviewed. Its Swiggy part uses the same official Swiggy MCP servers we use; its Blinkit part logs in by impersonating a browser and was not adopted. The FitPlate server gained a hosted mode: access key, allowed websites, saved login, paste-back sign-in (`docs/HOSTED_SERVER.md`). Hosting decision: Oracle Cloud Always Free VM preferred (`docs/ORACLE_SETUP.md`); the alternative of rewriting for Cloudflare was offered. The AI dish creator can move to the same VM later.
- **29 Oct 2026, Day 12 (`1c620d8`):** video slot, read aloud (`expo-speech`, iPhone rebuild needed), camera-check plan (`docs/COOK_MODE_EXTRAS.md`), "Logged to Today" card, late-night helper.
