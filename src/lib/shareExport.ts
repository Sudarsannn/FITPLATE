import { Platform, Share } from 'react-native';

/** Gives the person their exported data: a file download on the web, the share sheet on a phone. Returns false if they cancelled. */
export async function deliverExport(json: string, name = 'fitplate-my-data.json'): Promise<boolean> {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
  const r = await Share.share({ message: json, title: name });
  return r.action !== Share.dismissedAction;
}
