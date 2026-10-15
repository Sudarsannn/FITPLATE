import { Linking, Platform } from 'react-native';

export const ZEPTO_HOME = 'https://www.zepto.com/';

/**
 * Open a link in another app (Zepto, a UPI app) or its website. On the iPhone
 * an https product link opens the Zepto app when it is installed and Zepto
 * claims that link; otherwise it opens in the browser. Returns false when
 * nothing could open it (for example a upi:// link on a laptop).
 */
export async function openExternal(url: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      if (!/^https?:/i.test(url)) return false;
      window.open(url, '_blank', 'noopener');
      return true;
    }
    if (!/^https?:/i.test(url) && !(await Linking.canOpenURL(url))) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

/** The Zepto product page for an option, or Zepto's home page when the exact link isn't known. */
export function zeptoTarget(link: string | null | undefined): { url: string; exact: boolean } {
  return link && /^https:\/\/(www\.)?zepto(now)?\.com\//i.test(link) ? { url: link, exact: true } : { url: ZEPTO_HOME, exact: false };
}
