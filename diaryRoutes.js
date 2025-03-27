const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');

router.post('/', diaryController.createDiaryEntry);
router.get('/user/:userId', diaryController.getUserDiary);

module.exports = router;