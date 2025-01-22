require('dotenv').config();

// Verify environment variables are loaded
console.log('Environment variables loaded:', {
    DB_RW_HOST: process.env.DB_RW_HOST,
    DB_RW_USER: process.env.DB_RW_USER,
    DB_RW_DATABASE: process.env.DB_RW_DATABASE,
    has_password: !!process.env.DB_RW_PASSWORD
});

const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const routes = require('./routes');
const exphbs = require('express-handlebars');
const { sequelize } = require('./models');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy if behind a reverse proxy
app.set('trust proxy', 1);

// Configure CORS with credentials
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://192.168.1.71:19555',
            'http://192.168.1.71',
            'http://192.168.1.71:*', // Allow any port
            'http://localhost:19555',
            'http://localhost',
            'http://localhost:*', // Allow any port
            'http://127.0.0.1:3000',
            'http://127.0.0.1:*' // Allow any port on 127.0.0.1
        ];

        // Check if origin matches any of the allowed patterns
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed.endsWith(':*')) {
                // For wildcard ports, check the domain part
                const allowedDomain = allowed.slice(0, -2); // Remove :*
                return origin.startsWith(allowedDomain);
            }
            return origin === allowed;
        });

        if (!isAllowed) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Add cookie parser
app.use(cookieParser());

// Configure multer for file uploads
const upload = multer({
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Enable JSON parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// View engine setup with express-handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    // Add helpers
    helpers: {
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        eq: function (v1, v2) {
            return v1 === v2;
        },
        not: function (value) {
            return !value;
        },
        formatDate: function (date) {
            if (!date) return '';
            return new Date(date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to add currentRoute to all views
app.use((req, res, next) => {
    res.locals.currentRoute = req.path;
    next();
});

// Routes
app.use('/', routes);

// Error handler (should be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 