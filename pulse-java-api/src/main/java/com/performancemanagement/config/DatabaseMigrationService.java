package com.performancemanagement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Service to automatically migrate database schema on startup.
 * Handles dropping obsolete columns that Hibernate's ddl-auto=update doesn't handle.
 * Runs before Hibernate schema initialization to avoid database locking issues.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseMigrationService implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseMigrationService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private Environment environment;

    @Value("${spring.jpa.hibernate.ddl-auto:update}")
    private String ddlAuto;

    @Override
    public void run(String... args) {
        // Only run migrations if ddl-auto is set to update or create
        if (!ddlAuto.equals("update") && !ddlAuto.equals("create")) {
            logger.info("Schema auto-migration skipped (ddl-auto={})", ddlAuto);
            return;
        }

        try {
            String dbUrl = environment.getProperty("spring.datasource.url", "");
            
            if (dbUrl.contains("sqlite")) {
                migrateSqliteSchema();
            } else if (dbUrl.contains("postgresql")) {
                migratePostgreSQLSchema();
            } else {
                logger.info("Schema auto-migration for non-SQLite/PostgreSQL databases is handled by Hibernate");
            }
        } catch (Exception e) {
            logger.error("Error during schema migration", e);
            // Don't fail startup if migration fails - Hibernate will still try to update
        }
    }

    private void migrateSqliteSchema() {
        logger.info("Starting SQLite schema auto-migration...");

        try {
            // Migrate old table names (without prefix) to new prefixed names
            migrateTableNames();
            
            // Check and fix tenants table
            if (tableExists("epm_tenants")) {
                fixTenantsTable();
            }

            logger.info("SQLite schema auto-migration completed successfully");
        } catch (Exception e) {
            logger.error("Error during SQLite schema migration", e);
        }
    }

    /**
     * Migrates old table names (without epm_ prefix) to new prefixed names.
     * This handles the transition from non-prefixed to prefixed table names.
     */
    private void migrateTableNames() {
        // Map of old table names to new table names
        String[][] tableMigrations = {
            {"tenants", "epm_tenants"},
            {"users", "epm_users"},
            {"departments", "epm_departments"},
            {"goals", "epm_goals"},
            {"goal_assignments", "epm_goal_assignments"}
        };

        for (String[] migration : tableMigrations) {
            String oldName = migration[0];
            String newName = migration[1];
            
            try {
                // If old table exists and new table doesn't, rename it
                if (tableExists(oldName) && !tableExists(newName)) {
                    logger.info("Migrating table '{}' to '{}'", oldName, newName);
                    jdbcTemplate.execute("ALTER TABLE " + oldName + " RENAME TO " + newName);
                    logger.info("Successfully migrated table '{}' to '{}'", oldName, newName);
                } else if (tableExists(oldName) && tableExists(newName)) {
                    // Both exist - drop the old one (assuming new one has correct schema)
                    logger.warn("Both '{}' and '{}' exist. Dropping old table '{}'", oldName, newName, oldName);
                    jdbcTemplate.execute("DROP TABLE IF EXISTS " + oldName);
                }
            } catch (Exception e) {
                logger.error("Error migrating table from '{}' to '{}'", oldName, newName, e);
                // Continue with other migrations even if one fails
            }
        }
    }

    private void fixTenantsTable() {
        try {
            List<String> columns = getTableColumns("epm_tenants");
            
            // Check if subdomain column exists (should be removed)
            if (columns.contains("subdomain")) {
                logger.info("Removing obsolete 'subdomain' column from tenants table...");
                recreateTenantsTable();
            }
            
            // Check if id column exists but fqdn is primary key (should remove id)
            if (columns.contains("id") && columns.contains("fqdn")) {
                // Check if fqdn is already the primary key
                if (!isFqdnPrimaryKey()) {
                    logger.info("Recreating tenants table with fqdn as primary key...");
                    recreateTenantsTable();
                } else if (columns.contains("id")) {
                    // fqdn is PK but id column still exists, remove it
                    logger.info("Removing obsolete 'id' column from tenants table...");
                    recreateTenantsTable();
                }
            }
        } catch (Exception e) {
            logger.error("Error fixing tenants table", e);
        }
    }

    private void recreateTenantsTable() {
        try {
            // Get existing data if any (do this first before any schema changes)
            List<Object[]> existingData = jdbcTemplate.query(
                "SELECT fqdn, name, active FROM epm_tenants",
                (rs, rowNum) -> new Object[]{
                    rs.getString("fqdn"),
                    rs.getString("name"),
                    rs.getBoolean("active")
                }
            );

            // Create new table with correct schema
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS epm_tenants_new (
                    fqdn varchar(255) not null unique primary key,
                    name varchar(255) not null,
                    active boolean not null
                )
            """);

            // Copy data if any exists
            if (!existingData.isEmpty()) {
                for (Object[] row : existingData) {
                    jdbcTemplate.update(
                        "INSERT INTO epm_tenants_new (fqdn, name, active) VALUES (?, ?, ?)",
                        row[0], row[1], row[2]
                    );
                }
                logger.info("Migrated {} tenant records", existingData.size());
            }

            // Drop old table
            jdbcTemplate.execute("DROP TABLE IF EXISTS epm_tenants");

            // Rename new table
            jdbcTemplate.execute("ALTER TABLE epm_tenants_new RENAME TO epm_tenants");

            logger.info("Successfully recreated tenants table with correct schema");
        } catch (Exception e) {
            logger.error("Error recreating tenants table", e);
            throw e;
        }
    }

    private boolean tableExists(String tableName) {
        try {
            String sql = "SELECT name FROM sqlite_master WHERE type='table' AND name=?";
            List<String> results = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("name"), tableName);
            return !results.isEmpty();
        } catch (Exception e) {
            logger.error("Error checking if table exists: " + tableName, e);
            return false;
        }
    }

    private List<String> getTableColumns(String tableName) {
        List<String> columns = new ArrayList<>();
        try {
            jdbcTemplate.getDataSource().getConnection().createStatement().execute("PRAGMA table_info(" + tableName + ")");
            // For SQLite, use a simpler approach
            String sql = "PRAGMA table_info(" + tableName + ")";
            List<String> results = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("name"));
            columns.addAll(results);
        } catch (Exception e) {
            logger.error("Error getting table columns for: " + tableName, e);
        }
        return columns;
    }

    private boolean isFqdnPrimaryKey() {
        try {
            // Check if fqdn is the primary key by querying sqlite_master
            String sql = """
                SELECT sql FROM sqlite_master 
                WHERE type='table' AND name='epm_tenants'
            """;
            List<String> results = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("sql"));
            
            if (!results.isEmpty()) {
                String createStatement = results.get(0).toLowerCase();
                // Check if fqdn is defined as primary key
                return createStatement.contains("fqdn") && 
                       (createStatement.contains("primary key") || createStatement.contains("primary"));
            }
        } catch (Exception e) {
            logger.error("Error checking if fqdn is primary key", e);
        }
        return false;
    }

    /**
     * Handles PostgreSQL-specific schema migrations.
     * Fixes issues where Hibernate tries to add NOT NULL columns to existing tables with data.
     */
    private void migratePostgreSQLSchema() {
        logger.info("Starting PostgreSQL schema auto-migration...");

        try {
            // Fix locked column in epm_goals table
            fixGoalsLockedColumn();
            
            logger.info("PostgreSQL schema auto-migration completed successfully");
        } catch (Exception e) {
            logger.error("Error during PostgreSQL schema migration", e);
        }
    }

    /**
     * Fixes the locked column in epm_goals table.
     * If the column doesn't exist, adds it as nullable, updates existing rows, then makes it NOT NULL.
     * If the column exists but has NULL values, updates them to false.
     */
    private void fixGoalsLockedColumn() {
        try {
            if (!tableExistsPostgreSQL("epm_goals")) {
                logger.info("epm_goals table does not exist yet, skipping locked column migration");
                return;
            }

            boolean columnExists = columnExistsPostgreSQL("epm_goals", "locked");
            
            if (!columnExists) {
                // Column doesn't exist - add it as nullable first
                logger.info("Adding 'locked' column to epm_goals table as nullable...");
                jdbcTemplate.execute("ALTER TABLE epm_goals ADD COLUMN locked BOOLEAN");
                
                // Update all existing rows to have locked = false
                logger.info("Setting locked = false for all existing goals...");
                int updated = jdbcTemplate.update("UPDATE epm_goals SET locked = false WHERE locked IS NULL");
                logger.info("Updated {} goals with locked = false", updated);
                
                // Now make it NOT NULL
                logger.info("Making 'locked' column NOT NULL...");
                jdbcTemplate.execute("ALTER TABLE epm_goals ALTER COLUMN locked SET NOT NULL");
                logger.info("Successfully added and configured 'locked' column");
            } else {
                // Column exists - check if there are NULL values and fix them
                Integer nullCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM epm_goals WHERE locked IS NULL",
                    Integer.class
                );
                
                if (nullCount != null && nullCount > 0) {
                    logger.info("Found {} goals with NULL locked value, updating to false...", nullCount);
                    int updated = jdbcTemplate.update("UPDATE epm_goals SET locked = false WHERE locked IS NULL");
                    logger.info("Updated {} goals with locked = false", updated);
                    
                    // Try to make it NOT NULL if it isn't already
                    try {
                        jdbcTemplate.execute("ALTER TABLE epm_goals ALTER COLUMN locked SET NOT NULL");
                        logger.info("Successfully set 'locked' column to NOT NULL");
                    } catch (Exception e) {
                        logger.warn("Could not set 'locked' column to NOT NULL (may already be NOT NULL): {}", e.getMessage());
                    }
                } else {
                    logger.info("'locked' column already exists and has no NULL values");
                }
            }
        } catch (Exception e) {
            logger.error("Error fixing locked column in epm_goals table", e);
            // Don't throw - let Hibernate try to handle it
        }
    }

    private boolean tableExistsPostgreSQL(String tableName) {
        try {
            String sql = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?)";
            Boolean exists = jdbcTemplate.queryForObject(sql, Boolean.class, tableName);
            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            logger.error("Error checking if table exists (PostgreSQL): " + tableName, e);
            return false;
        }
    }

    private boolean columnExistsPostgreSQL(String tableName, String columnName) {
        try {
            String sql = """
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = ? 
                    AND column_name = ?
                )
            """;
            Boolean exists = jdbcTemplate.queryForObject(sql, Boolean.class, tableName, columnName);
            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            logger.error("Error checking if column exists (PostgreSQL): {}.{}", tableName, columnName, e);
            return false;
        }
    }
}

