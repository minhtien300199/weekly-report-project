const GSCService = require('../services/gscService');
const { LoggingService } = require('../services/categoryLocationService');

class GSCController {
    async showReport(req, res) {
        try {
            res.render('reports/gsc-report');

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
            const { startDate, endDate, type } = req.query;
            const gscService = new GSCService();

            let data;
            if (type === 'keywords') {
                data = await gscService.getTopKeywords(startDate, endDate);
            } else if (type === 'pages') {
                data = await gscService.getTopPages(startDate, endDate);
            } else if (type === 'comparison') {
                data = await gscService.getComparisonData(startDate, endDate);
            } else {
                throw new Error('Invalid data type requested');
            }

            res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error fetching GSC data:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new GSCController(); 