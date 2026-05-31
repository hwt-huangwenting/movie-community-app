import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../auth/AuthContext';
import { Rating } from '@mui/material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const Comments = ({ movieId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    try {
      const response = await api.get(`/movies/${movieId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  }, [movieId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && rating === 0) return;

    try {
      const response = await api.post(
        '/comments',
        {
          movie_id: movieId,
          content: newComment.trim() ? newComment : null,
          rating: rating !== 0 ? rating : null
        }
      );

      response.data.hwt_id = response.data.id;

      setComments([response.data, ...comments]);
      setNewComment('');
      setRating(0);
      alert('评论发表成功！');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('请先登录后再发表评论');
      } else {
        alert('添加评论失败，请重试');
      }
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;

    console.log('Attempting to delete comment with ID:', commentId, 'for user ID:', user ? user.id : 'undefined');

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter(comment => comment.hwt_id !== commentId));
    } catch (error) {
      console.error('删除评论失败:', error);
      alert('删除评论失败，请重试');
    }
  };

  return (
    <div className="comment-section">
      <h3>评论</h3>
      {!user && (
        <div style={{ margin: '1rem 0', color: '#d9534f', fontSize: '1rem', paddingLeft: '2px' }}>
          请先 <a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>登录</a> 后再发表评论。
        </div>
      )}
      {user && (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="rating-input">
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              precision={1}
            />
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            required
          />
          <button type="submit" disabled={!newComment.trim() && rating === 0}>
            发表评论
          </button>
        </form>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.hwt_id} className="comment">
            <div className="comment-header">
              <div className="user-info-and-date">
                <div className="user-info-block">
                  <span className="user-icon">👤</span>
                  <span className="username">{comment.username}</span>
                </div>
                <span className="date">
                  {format(new Date(comment.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </span>
              </div>
              {user && user.id === comment.user_id && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(comment.hwt_id)}
                >
                  删除
                </button>
              )}
            </div>
            <div className="comment-rating">
              <Rating value={comment.rating} readOnly />
            </div>
            <p className="comment-content">{comment.content}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .comment-section {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 1.5rem;
          margin: 1rem auto;
          max-width: 450px;
        }

        .comment-form {
          margin-bottom: 1rem;
        }

        .rating-input {
          margin-bottom: 1rem;
        }

        textarea {
          width: 100%;
          min-height: 50px;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
        }

        button {
          padding: 0.5rem 1rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .comments-list {
          margin-top: 2rem;
        }

        .comment {
          border-bottom: 1px solid #eee;
          padding: 1rem 0;
        }

        .comment-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .user-info-and-date {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          width: 100%;
          max-width: calc(100% - 60px);
        }

        .user-info-block {
          display: flex;
          align-items: center;
          background-color: #e9e9eb;
          border-radius: 20px;
          padding: 0.4rem 0.8rem;
          margin-right: 0.8rem;
          flex-shrink: 0;
        }

        .user-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 24px;
          height: 24px;
          background-color: #e0e0e0;
          border-radius: 50%;
          color: #6a1b9a;
          font-size: 1.2rem;
          margin-right: 0.3rem;
          flex-shrink: 0;
        }

        .username {
          font-weight: bold;
          color: black;
          margin-right: 0;
        }

        .date {
          color: #666;
          font-size: 0.9rem;
          flex-shrink: 0;
          margin-left: 0.5rem;
        }

        .delete-btn {
          margin-left: auto;
          background-color: #dc3545;
          padding: 0.25rem 0.5rem;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .comment-rating {
          margin-bottom: 0.5rem;
        }

        .comment-content {
          margin: 0.5rem 0 0 0;
          line-height: 1.5;
        }

        .comments-section h3 {
          margin-top: 5rem;
        }
      `}</style>
    </div>
  );
};

export default Comments; 