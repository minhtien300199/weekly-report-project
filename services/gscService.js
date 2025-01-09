const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

class GSCService {
    constructor() {
        // Create JWT client using service account
        this.auth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
        });

        this.searchConsole = google.searchconsole('v1');
    }

    async getSearchAnalytics(startDate, endDate) {
        try {
            const response = await this.searchConsole.searchanalytics.query({
                siteUrl: process.env.GSC_SITE_URL,
                auth: this.auth,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['query', 'page', 'device', 'country'],
                    rowLimit: 1000
                }
            });

            return response.data.rows;
        } catch (error) {
            console.error('Error fetching GSC data:', error);
            throw error;
        }
    }
}

module.exports = GSCService; 