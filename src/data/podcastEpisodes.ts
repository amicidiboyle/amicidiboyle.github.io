export type PodcastEpisode = {
  /** ISO date: YYYY-MM-DD (optional but recommended for sorting) */
  date?: string;
  title: string;
  /** Direct episode link on Spotify (or other platform) */
  url: string;
};

export const episodes: PodcastEpisode[] = [
  // Add episodes here if you want a full clickable list (in addition to the Spotify embedded show).
  // Example:
  // { date: "2025-10-01", title: "Episode title", url: "https://open.spotify.com/episode/..." },
];
