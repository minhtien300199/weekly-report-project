const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        // Initialize the Gemini API with your API key
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    /**
     * Generate text content using Gemini AI
     * @param {string} prompt - The input prompt for generation
     * @returns {Promise<string>} Generated content
     */
    async generateContent(prompt) {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating content with Gemini:', error);
            throw error;
        }
    }

    /**
     * Analyze GSC data and provide insights
     * @param {Object} data - The GSC data to analyze
     * @returns {Promise<string>} Analysis insights
     */
    async analyzeGSCData(data) {
        try {
            const prompt = `
                As an SEO expert, analyze this Google Search Console data and provide key insights:
                
                Data Summary:
                - Total Impressions: ${data.totalImpressions}
                - Total Clicks: ${data.totalClicks}
                - Average Position: ${data.avgPosition}
                - Average CTR: ${data.avgCTR}%
                - Highest Daily Impressions: ${data.maxImpressions}
                - Lowest Daily Impressions: ${data.minImpressions}
                - Highest Daily Clicks: ${data.maxClicks}
                - Lowest Daily Clicks: ${data.minClicks}

                Please provide:
                1. Key observations about the performance
                2. Areas of improvement
                3. Actionable recommendations
                4. Notable trends or patterns
                
                Format the response in clear, concise bullet points.
            `;

            return await this.generateContent(prompt);
        } catch (error) {
            console.error('Error analyzing GSC data:', error);
            throw error;
        }
    }

    /**
     * Compare two periods of GSC data and provide insights
     * @param {Object} period1 - First period data
     * @param {Object} period2 - Second period data
     * @returns {Promise<string>} Comparison insights
     */
    async compareGSCPeriods(period1, period2) {
        try {
            const prompt = `
                As an SEO expert, compare these two periods of Google Search Console data and provide insights:
                
                Period 1:
                - Total Impressions: ${period1.totalImpressions}
                - Total Clicks: ${period1.totalClicks}
                - Average Position: ${period1.avgPosition}
                - Average CTR: ${period1.avgCTR}%

                Period 2:
                - Total Impressions: ${period2.totalImpressions}
                - Total Clicks: ${period2.totalClicks}
                - Average Position: ${period2.avgPosition}
                - Average CTR: ${period2.avgCTR}%

                Percentage Changes:
                - Impressions Change: ${period1.impChange}%
                - Clicks Change: ${period1.clickChange}%

                Please provide:
                1. Analysis of the changes between periods
                2. Possible reasons for significant changes
                3. Recommendations based on the trends
                4. Areas that need attention
                
                Format the response in clear, concise bullet points.
            `;

            return await this.generateContent(prompt);
        } catch (error) {
            console.error('Error comparing GSC periods:', error);
            throw error;
        }
    }
}

module.exports = GeminiService; 