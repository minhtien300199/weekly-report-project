const express = require('express');
const router = express.Router();
const categoryLocationController = require('../controllers/categoryLocationController');
const gscController = require('../controllers/gscController');

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/category-location-report', categoryLocationController.showReport);
router.get('/api/location-category-data', categoryLocationController.getReportData);

// GSC Routes
router.get('/gsc-report', gscController.showReport);
router.get('/api/gsc-data', gscController.getGSCData);

module.exports = router; 