const axios = require('axios');
const SearchQuota = require('../models/SearchQuota');
const { Op } = require('sequelize');

class GoogleSearchService {
    constructor() {
        this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        this.dailyLimit = 100;
    }

    async checkQuota(userId) {
        const today = new Date().toISOString().split('T')[0];

        const [quota] = await SearchQuota.findOrCreate({
            where: {
                user_id: userId,
                date: today
            },
            defaults: {
                count: 0
            }
        });

        if (quota.count >= this.dailyLimit) {
            throw new Error('Daily search limit exceeded');
        }

        return this.dailyLimit - quota.count;
    }

    async incrementQuota(userId) {
        const today = new Date().toISOString().split('T')[0];

        await SearchQuota.increment('count', {
            where: {
                user_id: userId,
                date: today
            }
        });
    }

    async search(query, options = {}, userId) {
        try {
            // Check quota before performing search
            await this.checkQuota(userId);

            const params = {
                key: this.apiKey,
                cx: this.searchEngineId,
                q: query,
                ...options
            };

            const response = await axios.get('https://customsearch.googleapis.com/customsearch/v1', {
                params
            });

            // Increment quota after successful search
            await this.incrementQuota(userId);

            return response.data;
        } catch (error) {
            if (error.response?.data) {
                throw new Error(error.response.data.error?.message || 'Search failed');
            }
            throw error;
        }
    }

    async getRemainingQuota(userId) {
        const remaining = await this.checkQuota(userId);
        return remaining;
    }
}

module.exports = GoogleSearchService; 