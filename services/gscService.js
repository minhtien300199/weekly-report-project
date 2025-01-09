const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

class GSCService {
    constructor() {
        this.auth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
        });

        this.searchConsole = google.searchconsole('v1');
    }

    async getTopKeywords(startDate, endDate, limit = 10) {
        try {
            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: process.env.GSC_SITE_URL,
                auth: this.auth,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['query'],
                    rowLimit: 100, // Get more to ensure we have enough after filtering
                    dimensionFilterGroups: [{
                        filters: [{
                            dimension: 'query',
                            operator: 'notContains',
                            expression: 'http'
                        }]
                    }]
                }
            });

            return response.data.rows
                .sort((a, b) => b.impressions - a.impressions)
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching top keywords:', error);
            throw error;
        }
    }

    async getTopPages(startDate, endDate, limit = 10) {
        try {
            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: process.env.GSC_SITE_URL,
                auth: this.auth,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['page'],
                    rowLimit: 100 // Get more to ensure we have enough after filtering
                }
            });

            return response.data.rows
                .sort((a, b) => b.clicks - a.clicks)
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching top pages:', error);
            throw error;
        }
    }

    async getComparisonData(startDate, endDate) {
        try {
            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: process.env.GSC_SITE_URL,
                auth: this.auth,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['date']  // Get daily data
                }
            });

            // Return daily data
            return response.data.rows?.map(row => ({
                date: row.keys[0],
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position
            })) || [];
        } catch (error) {
            console.error('Error fetching comparison data:', error);
            throw error;
        }
    }
}

module.exports = GSCService; 