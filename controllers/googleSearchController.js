const GoogleSearchService = require('../services/googleSearchService');

class GoogleSearchController {
    constructor() {
        this.searchService = new GoogleSearchService();
        // Bind methods to ensure correct 'this' context
        this.showSearchTool = this.showSearchTool.bind(this);
        this.search = this.search.bind(this);
    }

    async showSearchTool(req, res) {
        try {
            const remainingQuota = await this.searchService.getRemainingQuota(req.user.id);
            res.render('tools/google-search', { remainingQuota });
        } catch (error) {
            console.error('Error showing search tool:', error);
            res.status(500).render('error/500', { error: 'Failed to load search tool' });
        }
    }

    async search(req, res) {
        try {
            const { query, ...options } = req.body;
            const results = await this.searchService.search(query, options, req.user.id);
            const remainingQuota = await this.searchService.getRemainingQuota(req.user.id);

            res.json({
                success: true,
                data: results,
                remainingQuota
            });
        } catch (error) {
            console.error('Search error:', error);
            res.status(error.message === 'Daily search limit exceeded' ? 429 : 500).json({
                success: false,
                error: error.message
            });
        }
    }
}

const controller = new GoogleSearchController();
module.exports = controller; 