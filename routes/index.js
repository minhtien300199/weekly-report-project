const express = require('express');
const router = express.Router();
const categoryLocationController = require('../controllers/categoryLocationController');
const gscController = require('../controllers/gscController');
const semrushController = require('../controllers/semrushController');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/category-location-report', categoryLocationController.showReport);
router.get('/api/location-category-data', categoryLocationController.getReportData);

// GSC Routes
router.get('/gsc-report', gscController.showReport);
router.get('/api/gsc-data', gscController.getGSCData);

// Semrush Routes
router.get('/semrush-report', semrushController.showReport);
router.post('/api/semrush/position-analysis', upload.single('file'), semrushController.analyzePositionData);
router.post('/api/semrush/position-changes', upload.single('file'), semrushController.analyzePositionChanges);

module.exports = router; 