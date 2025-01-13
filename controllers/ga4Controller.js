const GA4Service = require('../services/ga4Service');
const { LoggingService } = require('../services/categoryLocationService');

class GA4Controller {
    constructor() {
        this.ga4Service = new GA4Service();
    }

    showReport = async (req, res) => {
        try {
            res.render('reports/ga4-report');

            const logger = new LoggingService();
            await logger.logActivity('report_access', {
                report: 'ga4-report',
                user: req.user?.id || 'anonymous'
            });
        } catch (error) {
            console.error('Error showing GA4 report:', error);
            res.status(500).render('error', { error: 'Failed to load GA4 report' });
        }
    }

    getUserData = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const data = await this.ga4Service.getTotalUsers(startDate, endDate);
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching user data:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    getAcquisitionData = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const data = await this.ga4Service.getAcquisitionData(startDate, endDate);
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching acquisition data:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    getPageViewsData = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const data = await this.ga4Service.getPageViewsData(startDate, endDate);
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching page views data:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    getDeviceData = async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const data = await this.ga4Service.getDeviceData(startDate, endDate);
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching device data:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new GA4Controller(); 