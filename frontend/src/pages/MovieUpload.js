import React, { useState } from 'react';
import '../styles/MovieUpload.css';
import api from '../utils/api'; // Import the new api service

function MovieUpload() {
  const [movieData, setMovieData] = useState({
    hwt_title: '',
    year: '',
    rating: '',
    description: '',
    type: '',
    region: '',
    image: null,
    video: null
  });
  const [preview, setPreview] = useState({
    image: null,
    video: null
  });
  const [loading, setLoading] = useState(false);

  const typeOptions = ['剧情', '爱情', '动作', '科幻', '动画', '犯罪', '悬疑', '喜剧', '家庭', '战争', '古装', '都市', '青春', '自制', '农村', '穿越', '历史', '短剧', '生活', '偶像', '警剧', '其他'];
  const regionOptions = ['内地', '中国香港', '中国台湾', '美国', '日本', '英国', '法国', '其他'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovieData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setMovieData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // 创建预览URL
      const url = URL.createObjectURL(files[0]);
      setPreview(prev => ({
        ...prev,
        [name]: url
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(movieData).forEach(key => {
        if (movieData[key]) {
          formData.append(key, movieData[key]);
        }
      });

      // Use the api service for file upload
      await api.post('/movies/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Important for FormData
        }
      });

      // Axios throws an error for non-2xx responses, so the check below is not strictly needed
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || '上传失败');
      // }

      alert('电影上传成功！');
      
      // 清空表单
      setMovieData({
        hwt_title: '',
        year: '',
        rating: '',
        description: '',
        type: '',
        region: '',
        image: null,
        video: null
      });
      setPreview({ image: null, video: null });
      
    } catch (error) {
      console.error('上传错误:', error);
      alert('上传失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>上传新电影</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>电影标题</label>
          <input
            type="text"
            name="hwt_title"
            value={movieData.hwt_title}
            onChange={handleInputChange}
            required
            placeholder="请输入电影标题"
          />
        </div>

        <div className="form-group">
          <label>发行年份</label>
          <input
            type="number"
            name="year"
            value={movieData.year}
            onChange={handleInputChange}
            required
            placeholder="请输入发行年份"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        <div className="form-group">
          <label>评分</label>
          <input
            type="number"
            name="rating"
            value={movieData.rating}
            onChange={handleInputChange}
            required
            placeholder="请输入评分 (0-10)"
            min="0"
            max="10"
            step="0.1"
          />
        </div>

        <div className="form-group">
          <label>电影描述</label>
          <textarea
            name="description"
            value={movieData.description}
            onChange={handleInputChange}
            required
            placeholder="请输入电影描述"
          />
        </div>

        <div className="form-group">
          <label>类型</label>
          <select name="type" value={movieData.type} onChange={handleInputChange} required>
            <option value="">请选择类型</option>
            {typeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>地区</label>
          <select name="region" value={movieData.region} onChange={handleInputChange} required>
            <option value="">请选择地区</option>
            {regionOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>上传海报</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className="file-input"
          />
          {preview.image && (
            <div className="preview">
              <img src={preview.image} alt="海报预览" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>上传视频</label>
          <input
            type="file"
            name="video"
            onChange={handleFileChange}
            accept="video/*"
            className="file-input"
          />
          {preview.video && (
            <div className="preview">
              <video src={preview.video} controls width="100%" />
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? '上传中...' : '开始上传'}
        </button>
      </form>
    </div>
  );
}

export default MovieUpload; 