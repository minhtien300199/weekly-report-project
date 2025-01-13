const { CategoryLocationService, LoggingService } = require('../services/categoryLocationService');

class CategoryLocationController {
    async showReport(req, res) {
        try {
            res.render('reports/category-location');
        } catch (error) {
            console.error('Error showing category location report:', error);
            res.status(500).render('error', { error: 'Failed to load report' });
        }
    }

    async getReportData(req, res) {
        try {
            const service = new CategoryLocationService();
            const results = await service.getReportData();

            res.json({
                draw: parseInt(req.query.draw) || 1,
                recordsTotal: results.length,
                recordsFiltered: results.length,
                data: results
            });
        } catch (error) {
            console.error('Error fetching data:', error);
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

module.exports = new CategoryLocationController(); 