const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
    try {
        // Get all migration files
        const files = await fs.readdir(__dirname);
        const migrationFiles = files.filter(f =>
            f.endsWith('.js') &&
            f !== 'runner.js'
        );

        console.log('Found migration files:', migrationFiles);

        // Run each migration in sequence
        for (const file of migrationFiles) {
            console.log(`Running migration: ${file}`);
            const migration = require(path.join(__dirname, file));

            // Check if the migration has a function to run
            const migrationFn = Object.values(migration)[0];
            if (typeof migrationFn === 'function') {
                await migrationFn();
                console.log(`Completed migration: ${file}`);
            } else {
                console.warn(`No migration function found in ${file}`);
            }
        }

        console.log('All migrations completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigrations(); 