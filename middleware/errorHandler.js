const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }

    // Handle different types of errors
    if (err.status === 404) {
        return res.status(404).render('error/404', {
            error: 'Page not found'
        });
    }

    // Default to 500 error
    res.status(err.status || 500).render('error/500', {
        error: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler; 