const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fraternitybase',
    multipleStatements: true
  });

  try {
    console.log('✓ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_travel_map_viewers_table.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    console.log('Running travel_map_viewers table migration...');

    // Execute migration
    await connection.query(migrationSQL);

    console.log('✓ Migration completed successfully');
    console.log('✓ Table travel_map_viewers created');

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration()
  .then(() => {
    console.log('\n✓ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error:', error);
    process.exit(1);
  });
