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

const app = express();

// Add cookie parser
app.use(cookieParser());

// Configure multer for file uploads
const upload = multer({
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Enable CORS
app.use(cors());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 