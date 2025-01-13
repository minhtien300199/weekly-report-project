const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

class GA4Service {
    constructor() {
        this.auth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/analytics.readonly']
        });

        this.analyticsData = google.analyticsdata('v1beta');
        this.propertyId = process.env.GA4_PROPERTY_ID;
    }

    async getTotalUsers(startDate, endDate) {
        try {
            const response = await this.analyticsData.properties.runReport({
                property: `properties/${this.propertyId}`,
                auth: this.auth,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [
                        { name: 'totalUsers' },
                        { name: 'newUsers' },
                        { name: 'activeUsers' }
                    ]
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching total users:', error);
            throw error;
        }
    }

    async getAcquisitionData(startDate, endDate) {
        try {
            const response = await this.analyticsData.properties.runReport({
                property: `properties/${this.propertyId}`,
                auth: this.auth,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [
                        { name: 'yearMonth' },
                        { name: 'day' },
                        { name: 'sessionDefaultChannelGroup' }
                    ],
                    metrics: [
                        { name: 'sessions' }
                    ],
                    orderBys: [
                        { dimension: { dimensionName: 'yearMonth' } },
                        { dimension: { dimensionName: 'day' } }
                    ]
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching acquisition data:', error);
            throw error;
        }
    }

    async getPageViewsData(startDate, endDate) {
        try {
            const response = await this.analyticsData.properties.runReport({
                property: `properties/${this.propertyId}`,
                auth: this.auth,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [
                        { name: 'pageTitle' },
                        { name: 'pagePath' }
                    ],
                    metrics: [
                        { name: 'screenPageViews' },
                        { name: 'engagementRate' }
                    ],
                    orderBys: [
                        { metric: { metricName: 'screenPageViews' }, desc: true }
                    ],
                    limit: 50
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching page views data:', error);
            throw error;
        }
    }

    async getDeviceData(startDate, endDate) {
        try {
            const response = await this.analyticsData.properties.runReport({
                property: `properties/${this.propertyId}`,
                auth: this.auth,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [
                        { name: 'deviceCategory' }
                    ],
                    metrics: [
                        { name: 'activeUsers' }
                    ],
                    orderBys: [
                        { metric: { metricName: 'activeUsers' }, desc: true }
                    ]
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching device data:', error);
            throw error;
        }
    }
}

module.exports = GA4Service; 