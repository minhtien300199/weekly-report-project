const GSCService = require('../services/gscService');
const { LoggingService } = require('../services/categoryLocationService');

class GSCController {
    async showReport(req, res) {
        try {
            res.render('reports/gsc-report');

            // Log the report access
            const logger = new LoggingService();
            await logger.logActivity('report_access', {
                report: 'gsc-report',
                user: req.user?.id || 'anonymous'
            });
        } catch (error) {
            console.error('Error showing GSC report:', error);
            res.status(500).render('error', { error: 'Failed to load GSC report' });
        }
    }

    async getGSCData(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const gscService = new GSCService();
            const results = await gscService.getSearchAnalytics(startDate, endDate);

            res.json({
                draw: parseInt(req.query.draw) || 1,
                recordsTotal: results.length,
                recordsFiltered: results.length,
                data: results
            });
        } catch (error) {
            console.error('Error fetching GSC data:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error.message,
                draw: parseInt(req.query.draw) || 1,
                recordsTotal: 0,
                recordsFiltered: 0,
                data: []
            });
        }
    }
}

module.exports = new GSCController(); 