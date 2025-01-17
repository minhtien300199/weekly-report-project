const express = require('express');
const router = express.Router();
const categoryLocationController = require('../controllers/categoryLocationController');
const gscController = require('../controllers/gscController');
const semrushController = require('../controllers/semrushController');
const dataForSeoController = require('../controllers/dataForSeoController');
const ga4Controller = require('../controllers/ga4Controller');
const multer = require('multer');
const { auth, redirectIfAuthenticated } = require('../middleware/auth');
const authController = require('../controllers/authController');
const activityLogger = require('../middleware/logging');
const adminController = require('../controllers/adminController');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Split routes into authenticated and non-authenticated
// Non-authenticated routes (login related)
const authRoutes = express.Router();
authRoutes.get('/login', redirectIfAuthenticated, authController.showLogin);
authRoutes.post('/auth/login', authController.login);
authRoutes.get('/logout', authController.logout);

// Add auth routes before the auth middleware
router.use('/', authRoutes);

// Apply auth middleware to all routes below this line
router.use(auth);

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/category-location-report',
    activityLogger('report_access', { report: 'category-location' }),
    categoryLocationController.showReport
);
router.get('/api/location-category-data', auth, categoryLocationController.getReportData);

// GSC Routes
router.get('/gsc-report',
    activityLogger('report_access', { report: 'gsc-report' }),
    gscController.showReport
);
router.get('/api/gsc-data', auth, gscController.getGSCData);

// Semrush Routes
router.get('/semrush-report',
    activityLogger('report_access', { report: 'semrush-report' }),
    semrushController.showReport
);
router.post('/api/semrush/position-analysis',
    auth,
    upload.single('file'),
    activityLogger('semrush_analysis', { type: 'position_analysis' }),
    semrushController.analyzePositionData
);
router.post('/api/semrush/position-changes',
    auth,
    upload.single('file'),
    activityLogger('semrush_analysis', { type: 'position_changes' }),
    semrushController.analyzePositionChanges
);

// DataForSEO Routes
router.get('/dataforseo-report', auth, dataForSeoController.showReport);
router.post('/api/dataforseo/serp', auth, dataForSeoController.getSerps);
router.get('/api/dataforseo/user', auth, dataForSeoController.getUserInfo);

// Google Analytics 4 Routes
router.get('/ga4-report', auth, ga4Controller.showReport);
router.get('/api/ga4/users', auth, ga4Controller.getUserData);
router.get('/api/ga4/acquisition', auth, ga4Controller.getAcquisitionData);
router.get('/api/ga4/pageviews', auth, ga4Controller.getPageViewsData);
router.get('/api/ga4/devices', auth, ga4Controller.getDeviceData);

// Admin routes
router.get('/admin/users',
    activityLogger('admin_access', { section: 'user_management' }),
    adminController.showUsers
);
router.post('/admin/users', auth, adminController.createUser);
router.put('/admin/users/:id', auth, adminController.updateUser);
router.delete('/admin/users/:id', auth, adminController.deleteUser);

// Topical Map route
router.get('/topical-map', auth, (req, res) => {
    res.render('tools/topical-map');
});

module.exports = router; 