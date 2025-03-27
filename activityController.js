const activityService = require('../services/activityService');

exports.getAllActivities = async (req, res) => {
  try {
    const activities = await activityService.getAllActivities();
    res.json(activities);
  } catch (err) {
    console.error('Error getting activities:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addActivity = async (req, res) => {
  try {
    const activity = await activityService.createActivity(req.body);
    res.status(201).json(activity);
  } catch (err) {
    console.error('Error adding activity:', err);
    res.status(500).json({ 
      error: err.message || 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};