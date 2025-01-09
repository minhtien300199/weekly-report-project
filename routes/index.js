const express = require('express');
const router = express.Router();
const categoryLocationController = require('../controllers/categoryLocationController');

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/category-location-report', categoryLocationController.showReport);
router.get('/api/location-category-data', categoryLocationController.getReportData);

module.exports = router; 