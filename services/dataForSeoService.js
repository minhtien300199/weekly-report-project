const axios = require('axios');

class DataForSEOService {
    constructor() {
        this.baseURL = 'https://api.dataforseo.com/v3';
        this.auth = {
            username: process.env.DATAFORSEO_LOGIN,
            password: process.env.DATAFORSEO_API_KEY
        };
    }

    async getSerpResults(keyword) {
        try {
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/serp/google/organic/live/advanced`,
                auth: this.auth,
                data: [{
                    keyword: keyword,
                    location_name: "United States",
                    language_name: "English",
                    device: "desktop"
                }]
            });

            return response.data.tasks[0].result[0];
        } catch (error) {
            console.error('DataForSEO API Error:', error);
            throw error;
        }
    }

    async getKeywordData(keyword) {
        try {
            const response = await axios({
                method: 'post',
                url: `${this.baseURL}/keywords_data/google/search_volume/live`,
                auth: this.auth,
                data: [{
                    keywords: [keyword],
                    location_name: "United States",
                    language_name: "English"
                }]
            });

            return response.data.tasks[0].result[0];
        } catch (error) {
            console.error('DataForSEO API Error:', error);
            throw error;
        }
    }
}

module.exports = DataForSEOService;