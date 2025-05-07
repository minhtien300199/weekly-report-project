const GSCService = require('../services/gscService');
const { LoggingService } = require('../services/categoryLocationService');

class GSCController {
    async showReport(req, res) {
        try {
            res.render('reports/gsc-report');
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
            let totalMetrics;

            if (type === 'keywords') {
                data = await gscService.getTopKeywords(startDate, endDate);
                // Also get total metrics for the period
                totalMetrics = await gscService.getTotalMetrics(startDate, endDate);
            } else if (type === 'pages') {
                data = await gscService.getTopPages(startDate, endDate);
                // Also get total metrics for the period if not already fetched
                if (!totalMetrics) {
                    totalMetrics = await gscService.getTotalMetrics(startDate, endDate);
                }
            } else if (type === 'comparison') {
                data = await gscService.getComparisonData(startDate, endDate);
                // Also get total metrics for the comparison period
                totalMetrics = await gscService.getTotalMetrics(startDate, endDate);
            } else if (type === 'totalMetrics') {
                // Get only total metrics for the period
                totalMetrics = await gscService.getTotalMetrics(startDate, endDate);
                data = [];
            }

            res.json({
                success: true,
                data,
                totalMetrics
            });
        } catch (error) {
            console.error('Error fetching GSC data:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getTotalMetrics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const gscService = new GSCService();
            const totalMetrics = await gscService.getTotalMetrics(startDate, endDate);
            res.json({
                success: true,
                totalMetrics
            });
        } catch (error) {
            console.error('Error fetching total metrics:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new GSCController();