const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authenticateToken = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/movies/search', movieController.searchMovies);
router.get('/movies', movieController.getAllMovies);
router.get('/movies/popular', movieController.getPopularMovies);
router.get('/movies/:id', movieController.getMovieById);
router.get('/movies/:movieId/comments', movieController.getMovieComments);

// Protected routes (authentication required)
router.post('/comments', authenticateToken, movieController.addComment);
router.delete('/comments/:id', authenticateToken, movieController.deleteComment);
router.post('/collections', authenticateToken, movieController.addCollection);
router.delete('/collections/:movieId', authenticateToken, movieController.removeCollection);
router.get('/collections/status/:movieId', authenticateToken, movieController.checkCollectionStatus);
router.get('/collections/:userId', authenticateToken, movieController.getUserCollections);

module.exports = router; 