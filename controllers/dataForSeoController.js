const axios = require('axios');

class DataForSeoController {
    constructor() {
        // Bind methods to ensure correct 'this' context
        this.showReport = this.showReport.bind(this);
        this.getSerps = this.getSerps.bind(this);
        this.getTaskResults = this.getTaskResults.bind(this);
        this.waitForRateLimit = this.waitForRateLimit.bind(this);
    }

    async showReport(req, res) {
        try {
            res.render('reports/dataforseo-report', {
                currentRoute: '/dataforseo-report'
            });
        } catch (error) {
            console.error('Error showing DataForSEO report:', error);
            res.status(500).send('Error loading report');
        }
    }

    async waitForRateLimit() {
        console.log('Rate limit reached, waiting for 1 minute...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
        console.log('Resuming after rate limit wait');
    }

    async getSerps(req, res) {
        try {
            const { task } = req.body;
            if (!task || !task.keyword) {
                throw new Error('Keyword is required');
            }

            console.log('Task parameters:', task);

            // DataForSEO API credentials
            const username = process.env.DATAFORSEO_LOGIN;
            const password = process.env.DATAFORSEO_API_KEY;
            const auth = Buffer.from(`${username}:${password}`).toString('base64');

            // Prepare the task data
            const postData = [{
                ...task,
                tag: "google_organic",
                postback_url: null,
                pingback_url: null
            }];

            console.log('Posting task with data:', JSON.stringify(postData, null, 2));

            let postResponse;
            try {
                postResponse = await axios.post(
                    'https://api.dataforseo.com/v3/serp/google/organic/task_post',
                    postData,
                    {
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } catch (error) {
                if (error.response?.data?.status_message?.includes('rates limit')) {
                    await this.waitForRateLimit();
                    // Retry the request after waiting
                    postResponse = await axios.post(
                        'https://api.dataforseo.com/v3/serp/google/organic/task_post',
                        postData,
                        {
                            headers: {
                                'Authorization': `Basic ${auth}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                } else {
                    throw error;
                }
            }

            console.log('Task post response:', JSON.stringify(postResponse.data, null, 2));

            if (!postResponse.data?.tasks?.[0]?.id) {
                throw new Error('Failed to create task');
            }

            const taskId = postResponse.data.tasks[0].id;
            console.log('Created task with ID:', taskId);

            // Step 2: Wait for results
            const results = await this.getTaskResults(taskId, auth);

            console.log('Got results:', results ? 'Success' : 'No results');

            res.json({
                success: true,
                data: results
            });

        } catch (error) {
            console.error('DataForSEO API error:', error);
            console.error('Full error details:', {
                message: error.message,
                response: error.response?.data,
                stack: error.stack
            });
            res.status(500).json({
                success: false,
                error: {
                    message: error.message,
                    details: error.response?.data || error.stack
                }
            });
        }
    }

    async getTaskResults(taskId, auth) {
        try {
            let attempts = 0;
            const maxAttempts = 30;
            const delay = 5000; // 5 seconds

            console.log(`Starting to poll for results for task ${taskId}`);

            while (attempts < maxAttempts) {
                console.log(`Attempt ${attempts + 1}/${maxAttempts} to get results (waiting ${delay / 1000} seconds between attempts)`);

                let checkResponse;
                try {
                    // Step 1: Check if task is ready
                    checkResponse = await axios.get(
                        'https://api.dataforseo.com/v3/serp/google/organic/tasks_ready',
                        {
                            headers: {
                                'Authorization': `Basic ${auth}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                } catch (error) {
                    if (error.response?.data?.status_message?.includes('rates limit')) {
                        await this.waitForRateLimit();
                        // Skip this attempt and continue the loop
                        continue;
                    }
                    throw error;
                }

                console.log('Tasks ready response:', JSON.stringify(checkResponse.data, null, 2));

                // Check if the response status code is success (20000)
                if (checkResponse.data?.status_code !== 20000) {
                    console.log('Tasks ready response not successful:', checkResponse.data?.status_code);
                    // If it's a rate limit issue, we've already handled it in the catch block
                    // For other issues, wait and continue
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // Find our task in the ready tasks
                const readyTask = checkResponse.data?.tasks?.[0]?.result?.find(
                    task => task.id === taskId && task.tag === "google_organic"
                );

                if (readyTask) {
                    console.log('Task is ready, fetching results using endpoint:', readyTask.endpoint_regular);

                    let resultsResponse;
                    try {
                        // Step 2: Get results using the provided endpoint
                        resultsResponse = await axios.get(
                            `https://api.dataforseo.com${readyTask.endpoint_regular}`,
                            {
                                headers: {
                                    'Authorization': `Basic ${auth}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        console.log('Results response:', JSON.stringify(resultsResponse.data, null, 2));

                        if (resultsResponse.data?.status_code === 20000 && resultsResponse.data?.tasks?.[0]?.result?.[0]?.items) {
                            console.log('Successfully got results');
                            return resultsResponse.data.tasks[0].result[0].items;
                        }

                        console.log('No items in results');
                        // If we found the task and got a response (even with no items), we should exit
                        return [];
                    } catch (error) {
                        if (error.response?.data?.status_message?.includes('rates limit')) {
                            await this.waitForRateLimit();
                            continue;
                        }
                        throw error;
                    }
                }

                // If we've checked all tasks and didn't find ours, log it
                console.log(`Task ${taskId} not found in ready tasks. Available tasks:`,
                    checkResponse.data?.tasks?.[0]?.result?.map(t => ({ id: t.id, tag: t.tag }))
                );

                attempts++;
                console.log(`Waiting ${delay}ms before next attempt`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            console.log(`Timeout after ${maxAttempts} attempts`);
            throw new Error('Task timeout - results not ready after ' + maxAttempts + ' attempts');
        } catch (error) {
            console.error('Error getting task results:', error);
            console.error('Full error details:', {
                message: error.message,
                response: error.response?.data,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = new DataForSeoController(); 