const diaryService = require('../services/diaryService');

exports.createDiaryEntry = async (req, res) => {
  try {
    const result = await diaryService.createDiaryEntry(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error saving diary:', err);
    
    let errorMessage = 'Ошибка сервера при сохранении данных';
    if (err.code === '23503') {
      errorMessage = 'Ошибка: Неверный ID активности или записи дневника';
    } else if (err.message.includes('Активность с ID')) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getUserDiary = async (req, res) => {
  try {
    const diary = await diaryService.getUserDiary(req.params.userId);
    res.json(diary);
  } catch (err) {
    console.error('Ошибка получения дневника:', err);
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};