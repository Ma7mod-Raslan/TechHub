import axios from "axios";

export function extractVideoId(url) {
  if (!url) return null;

  const regExp =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regExp);
  return match ? match[1] : null;
}

export async function getYoutubeVideoDuration(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YouTube API key is missing");
  }

  const response = await axios.get(
    "https://www.googleapis.com/youtube/v3/videos",
    {
      params: {
        part: "contentDetails",
        id: videoId,
        key: apiKey
      }
    }
  );

  if (!response.data.items || !response.data.items.length) {
    throw new Error("Invalid YouTube video ID");
  }

  const isoDuration = response.data.items[0].contentDetails.duration;
  return convertIsoToSeconds(isoDuration);
}

function convertIsoToSeconds(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}
