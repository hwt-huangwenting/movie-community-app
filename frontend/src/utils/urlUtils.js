export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:5000${imagePath}`;
  }
  return imagePath;
};

export const getVideoUrl = (videoPath) => {
  if (!videoPath) return '';
  if (videoPath.startsWith('/uploads/')) {
    return `http://localhost:5000${videoPath}`;
  }
  return videoPath;
}; 