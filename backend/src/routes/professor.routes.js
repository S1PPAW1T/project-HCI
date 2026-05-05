const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professor.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', professorController.login);
router.get('/verify', authMiddleware, professorController.verify);
router.get('/participants', authMiddleware, professorController.getParticipants);
router.post('/rating', authMiddleware, professorController.submitRating);

module.exports = router;