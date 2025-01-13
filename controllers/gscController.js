const GSCService = require('../services/gscService');
const GeminiService = require('../services/geminiService');
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
            const geminiService = new GeminiService();

            let data;
            let aiInsights;

            if (type === 'keywords') {
                data = await gscService.getTopKeywords(startDate, endDate);
            } else if (type === 'pages') {
                data = await gscService.getTopPages(startDate, endDate);
            } else if (type === 'comparison') {
                data = await gscService.getComparisonData(startDate, endDate);
                // Get AI insights for comparison data
                aiInsights = await geminiService.analyzeGSCData({
                    totalImpressions: data.reduce((sum, d) => sum + d.impressions, 0),
                    totalClicks: data.reduce((sum, d) => sum + d.clicks, 0),
                    avgPosition: data.reduce((sum, d) => sum + d.position, 0) / data.length,
                    avgCTR: (data.reduce((sum, d) => sum + d.clicks, 0) / data.reduce((sum, d) => sum + d.impressions, 0)) * 100,
                    maxImpressions: Math.max(...data.map(d => d.impressions)),
                    minImpressions: Math.min(...data.map(d => d.impressions)),
                    maxClicks: Math.max(...data.map(d => d.clicks)),
                    minClicks: Math.min(...data.map(d => d.clicks))
                });
            }

            res.json({
                success: true,
                data,
                aiInsights
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