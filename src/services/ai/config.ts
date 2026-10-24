/** The FitPlate server that fronts the AI. Override with EXPO_PUBLIC_FITPLATE_AI_URL (no trailing slash). */
export const AI_BASE_URL: string = (process.env.EXPO_PUBLIC_FITPLATE_AI_URL || 'https://fitplate.sudarsanmohanchander.workers.dev').replace(/\/+$/, '');
