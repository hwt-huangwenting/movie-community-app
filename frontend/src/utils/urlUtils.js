const API_ORIGIN = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// 数据库里存的是相对路径：种子数据的海报在 public/img 下，
// 用户上传的文件由后端 /uploads 静态托管，来源不同所以要分别拼接。
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('/uploads/')) {
    return `${API_ORIGIN}${imagePath}`;
  }
  return imagePath;
};

export const getVideoUrl = (videoPath) => {
  if (!videoPath) return '';
  if (videoPath.startsWith('/uploads/')) {
    return `${API_ORIGIN}${videoPath}`;
  }
  return videoPath;
};
