const express = require('express');
const { getHeatmapData } = require('./analytics.controller');

const router = express.Router();

// GET /api/analytics/heatmap
router.get('/heatmap', getHeatmapData);

module.exports = router;
