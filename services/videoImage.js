const getId = (VideoLink) => {
  if (VideoLink.includes("youtube.com")) {
    var video_id = VideoLink?.split("v=")[1];
    var ampersandPosition = video_id?.indexOf("&");
    if (ampersandPosition != -1) {
      video_id = video_id?.substring(0, ampersandPosition);
    }
    return video_id;
  }
};

const videoImage = (VideoLink) => {
  return `https://img.youtube.com/vi/${getId(VideoLink)}/maxresdefault.jpg`;
};

module.exports = { videoImage };
