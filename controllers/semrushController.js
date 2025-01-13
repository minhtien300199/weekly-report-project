const { LoggingService } = require('../services/categoryLocationService');
const SemrushService = require('../services/semrushService');
const GeminiService = require('../services/geminiService');
const XLSX = require('xlsx');

class SemrushController {
    async showReport(req, res) {
        try {
            res.render('reports/semrush-report');
        } catch (error) {
            console.error('Error showing Semrush report:', error);
            res.status(500).render('error', { error: 'Failed to load report' });
        }
    }

    async analyzePositionData(req, res) {
        try {
            const semrushService = new SemrushService();
            const geminiService = new GeminiService();

            // Process the uploaded file
            if (!req.file) {
                throw new Error('No file uploaded');
            }

            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            const data = await semrushService.processPositionData(jsonData);
            const analysis = await geminiService.analyzeSemrushData(data);

            res.json({
                success: true,
                data,
                analysis
            });
        } catch (error) {
            console.error('Error analyzing position data:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async analyzePositionChanges(req, res) {
        try {
            const semrushService = new SemrushService();
            const geminiService = new GeminiService();

            // Process the uploaded file
            if (!req.file) {
                throw new Error('No file uploaded');
            }

            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            const data = await semrushService.processPositionChanges(jsonData);
            const analysis = await geminiService.analyzePositionChanges(data);

            res.json({
                success: true,
                data,
                analysis
            });
        } catch (error) {
            console.error('Error analyzing position changes:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new SemrushController(); 