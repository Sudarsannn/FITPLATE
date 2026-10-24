/**
 * Music while you cook or work out. FitPlate plays no music itself (the music
 * services do not allow that without their own approval and a listener
 * account); it opens a search for a suitable playlist in the service you pick,
 * which opens its app on a phone that has it.
 */
export type MusicKind = 'cooking' | 'workout';
export type MusicService = { id: string; label: string; url: (query: string) => string };

export const MUSIC_SERVICES: MusicService[] = [
  { id: 'spotify', label: 'Spotify', url: (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}` },
  { id: 'apple', label: 'Apple Music', url: (q) => `https://music.apple.com/search?term=${encodeURIComponent(q)}` },
  { id: 'youtube', label: 'YouTube Music', url: (q) => `https://music.youtube.com/search?q=${encodeURIComponent(q)}` },
  { id: 'soundcloud', label: 'SoundCloud', url: (q) => `https://soundcloud.com/search?q=${encodeURIComponent(q)}` },
];

export const MUSIC_MOODS: Record<MusicKind, { id: string; label: string; query: string }[]> = {
  cooking: [
    { id: 'easy', label: 'Easy going', query: 'cooking playlist' },
    { id: 'bollywood', label: 'Bollywood', query: 'bollywood cooking playlist' },
    { id: 'retro', label: 'Old Hindi hits', query: 'retro hindi hits kitchen' },
    { id: 'instrumental', label: 'Instrumental', query: 'instrumental cooking music' },
  ],
  workout: [
    { id: 'energy', label: 'High energy', query: 'workout playlist' },
    { id: 'bollywood', label: 'Bollywood gym', query: 'bollywood gym workout playlist' },
    { id: 'cardio', label: 'Cardio beats', query: 'cardio running playlist' },
    { id: 'calm', label: 'Calm and stretch', query: 'yoga stretching calm music' },
  ],
};

export const musicUrl = (service: MusicService, query: string) => service.url(query);
