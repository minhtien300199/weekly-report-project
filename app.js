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
const routes = require('./routes');
const exphbs = require('express-handlebars');
const { sequelize } = require('./models');

const app = express();

// Enable CORS
app.use(cors());

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 