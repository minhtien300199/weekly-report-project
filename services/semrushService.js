class SemrushService {
    /**
     * Process position data from Excel file
     * @param {Array} data - Raw data from Excel file
     * @returns {Object} Processed position data
     */
    async processPositionData(data) {
        try {
            // Process the position data
            const processedData = {
                totalKeywords: data.length,
                positionRanges: {
                    top3: data.filter(row => row.Position <= 3).length,
                    top10: data.filter(row => row.Position > 3 && row.Position <= 10).length,
                    top20: data.filter(row => row.Position > 10 && row.Position <= 20).length,
                    top50: data.filter(row => row.Position > 20 && row.Position <= 50).length,
                    top100: data.filter(row => row.Position > 50 && row.Position <= 100).length
                },
                averagePosition: data.reduce((sum, row) => sum + row.Position, 0) / data.length,
                trafficData: {
                    totalTraffic: data.reduce((sum, row) => sum + (row.Traffic || 0), 0),
                    averageTraffic: data.reduce((sum, row) => sum + (row.Traffic || 0), 0) / data.length
                },
                // Add keywords with traffic
                trafficKeywords: data
                    .filter(row => (row.Traffic || 0) > 0)
                    .sort((a, b) => (b.Traffic || 0) - (a.Traffic || 0))
                    .map(row => ({
                        keyword: row.Keyword,
                        position: row.Position,
                        traffic: row.Traffic,
                        searchVolume: row['Search Volume'],
                        trafficPercent: row['Traffic (%)']
                    }))
            };

            return processedData;
        } catch (error) {
            console.error('Error processing position data:', error);
            throw error;
        }
    }

    /**
     * Process position changes data from Excel file
     * @param {Array} data - Raw data from Excel file
     * @returns {Object} Processed position changes data
     */
    async processPositionChanges(data) {
        try {
            // Calculate position changes and add it to the data
            const processedData = data.map(row => ({
                ...row,
                Keyword: row.Keyword,
                OldPosition: row['Previous position'],
                NewPosition: row.Position,
                // Handle position 0 (lost from SERP)
                PositionChange: row.Position === 0 ? 100 : // Consider dropping out of SERP as +100 (worst case)
                    row['Previous position'] === 0 ? -row.Position : // New appearance in SERP
                        row.Position - row['Previous position'] // Normal position change
            }));

            // Sort data by timestamp to get correct date range
            const datesSorted = [...data].sort((a, b) => a.Timestamp - b.Timestamp);
            const oldestDate = datesSorted[0];
            const latestDate = datesSorted[datesSorted.length - 1];

            // Sort data by position change
            const sortedData = [...processedData].sort((a, b) => a.PositionChange - b.PositionChange);

            console.log('Processing position changes data:', {
                totalRows: data.length,
                sampleRow: data[0],
                sortedSample: sortedData[0]
            });

            const processedResults = {
                totalChanges: data.length,
                dateRange: {
                    // Convert Excel timestamp to readable date
                    from: oldestDate?.Timestamp ?
                        new Date((oldestDate.Timestamp - 25569) * 86400 * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })
                        : 'N/A',
                    to: latestDate?.Timestamp ?
                        new Date((latestDate.Timestamp - 25569) * 86400 * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })
                        : 'N/A'
                },
                improvements: processedData.filter(row =>
                    row.PositionChange < 0 ||
                    (row['Previous position'] === 0 && row.Position > 0)
                ).length,
                declines: processedData.filter(row =>
                    row.PositionChange > 0 ||
                    row.Position === 0
                ).length,
                unchanged: processedData.filter(row => row.PositionChange === 0).length,
                averageChange: processedData.reduce((sum, row) => sum + row.PositionChange, 0) / processedData.length,
                significantChanges: {
                    major_improvements: processedData.filter(row => row.PositionChange <= -10).length,
                    major_declines: processedData.filter(row => row.PositionChange >= 10).length
                },
                // Add top improvements and drops
                topImprovements: sortedData
                    .filter(row => row.PositionChange < 0 || (row['Previous position'] === 0 && row.Position > 0))
                    // Additional filter for traffic > 0
                    .filter(row => (row['Traffic (%)'] || 0) > 0)
                    // Sort by new position (ascending order - position 1 is better than position 100)
                    .sort((a, b) => a.Position - b.Position)
                    .map(row => ({
                        keyword: row.Keyword,
                        change: row.PositionChange,
                        newPosition: row.Position,
                        oldPosition: row['Previous position'],
                        searchVolume: row['Search Volume'],
                        traffic: row['Traffic (%)']
                    })),
                biggestDrops: sortedData
                    .filter(row => row.PositionChange > 0 || row.Position === 0)
                    // Additional filter for traffic > 0
                    .filter(row => (row['Traffic (%)'] || 0) > 0)
                    .sort((a, b) => Math.abs(b.PositionChange) - Math.abs(a.PositionChange))
                    .map(row => ({
                        keyword: row.Keyword,
                        change: row.PositionChange,
                        newPosition: row.Position === 0 ? 'Lost' : row.Position,
                        oldPosition: row['Previous position'],
                        searchVolume: row['Search Volume'],
                        traffic: row['Traffic (%)']
                    }))
            };

            // Add summary statistics
            processedResults.summary = {
                totalKeywords: data.length,
                improvedKeywords: processedResults.improvements,
                declinedKeywords: processedResults.declines,
                unchangedKeywords: processedResults.unchanged,
                averageChange: processedResults.averageChange.toFixed(2),
                significantImprovements: processedResults.significantChanges.major_improvements,
                significantDeclines: processedResults.significantChanges.major_declines,
                // Add traffic change calculations
                trafficChanges: {
                    increased: processedData
                        .filter(row => (row['Traffic Change'] || 0) > 0)
                        .reduce((sum, row) => sum + (row['Traffic Change'] || 0), 0),
                    decreased: processedData
                        .filter(row => (row['Traffic Change'] || 0) < 0)
                        .reduce((sum, row) => sum + Math.abs(row['Traffic Change'] || 0), 0),
                    total: processedData
                        .reduce((sum, row) => sum + (row['Traffic Change'] || 0), 0)
                }
            };

            return processedResults;
        } catch (error) {
            console.error('Error processing position changes:', error);
            throw error;
        }
    }
}

module.exports = SemrushService; 