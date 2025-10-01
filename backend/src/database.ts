import Database from 'better-sqlite3';
import { join } from 'path';

export interface WaitlistEntry {
  id?: number;
  email: string;
  signupDate: string;
  source?: string;
  referrer?: string;
  metadata?: string;
}

export interface CompanySignup {
  id?: number;
  name: string;
  email: string;
  companyName: string;
  companyDescription: string;
  signupDate: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
}

// Initialize SQLite database
const dbPath = join(__dirname, '../fraternity-base.db');
export const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
export function initializeDatabase() {
  console.log('🗃️  Initializing database...');

  // Waitlist table for simple email collection
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      signup_date TEXT NOT NULL,
      source TEXT DEFAULT 'landing',
      referrer TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Company signups table (existing functionality)
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      company_description TEXT NOT NULL,
      signup_date TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      verified_at TEXT,
      verified_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
    CREATE INDEX IF NOT EXISTS idx_waitlist_date ON waitlist(signup_date);
    CREATE INDEX IF NOT EXISTS idx_company_email ON company_signups(email);
    CREATE INDEX IF NOT EXISTS idx_company_status ON company_signups(status);
  `);

  console.log('✅ Database initialized successfully');
}

// Waitlist operations
export const waitlistDb = {
  // Add email to waitlist
  addEmail: (entry: WaitlistEntry) => {
    const stmt = db.prepare(`
      INSERT INTO waitlist (email, signup_date, source, referrer, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(
        entry.email,
        entry.signupDate,
        entry.source || 'landing',
        entry.referrer || null,
        entry.metadata || null
      );
      return { success: true, id: result.lastInsertRowid };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { success: false, error: 'Email already exists in waitlist' };
      }
      throw error;
    }
  },

  // Get all waitlist entries
  getAll: () => {
    const stmt = db.prepare(`
      SELECT * FROM waitlist
      ORDER BY created_at DESC
    `);
    return stmt.all();
  },

  // Get waitlist stats
  getStats: () => {
    const total = db.prepare('SELECT COUNT(*) as count FROM waitlist').get() as { count: number };
    const today = new Date().toISOString().split('T')[0];
    const todayCount = db.prepare(`
      SELECT COUNT(*) as count FROM waitlist
      WHERE date(created_at) = date(?)
    `).get(today) as { count: number };

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weekCount = db.prepare(`
      SELECT COUNT(*) as count FROM waitlist
      WHERE created_at >= ?
    `).get(thisWeek.toISOString()) as { count: number };

    return {
      total: total.count,
      today: todayCount.count,
      thisWeek: weekCount.count
    };
  },

  // Check if email exists
  emailExists: (email: string) => {
    const stmt = db.prepare('SELECT id FROM waitlist WHERE email = ?');
    return stmt.get(email) !== undefined;
  }
};

// Company signup operations
export const companyDb = {
  // Add company signup
  addSignup: (signup: CompanySignup) => {
    const stmt = db.prepare(`
      INSERT INTO company_signups (name, email, company_name, company_description, signup_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(
        signup.name,
        signup.email,
        signup.companyName,
        signup.companyDescription,
        signup.signupDate,
        'pending'
      );
      return { success: true, id: result.lastInsertRowid };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { success: false, error: 'Email already exists' };
      }
      throw error;
    }
  },

  // Get all signups
  getAll: () => {
    const stmt = db.prepare(`
      SELECT * FROM company_signups
      ORDER BY created_at DESC
    `);
    return stmt.all();
  },

  // Get signup by ID
  getById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM company_signups WHERE id = ?');
    return stmt.get(id);
  },

  // Update signup status
  updateStatus: (id: number, status: string, verifiedBy: string) => {
    const stmt = db.prepare(`
      UPDATE company_signups
      SET status = ?, verified_at = ?, verified_by = ?
      WHERE id = ?
    `);

    const result = stmt.run(status, new Date().toISOString(), verifiedBy, id);
    return result.changes > 0;
  },

  // Get stats
  getStats: () => {
    const total = db.prepare('SELECT COUNT(*) as count FROM company_signups').get() as { count: number };
    const pending = db.prepare('SELECT COUNT(*) as count FROM company_signups WHERE status = "pending"').get() as { count: number };
    const approved = db.prepare('SELECT COUNT(*) as count FROM company_signups WHERE status = "approved"').get() as { count: number };

    return {
      total: total.count,
      pending: pending.count,
      approved: approved.count,
      rejected: total.count - pending.count - approved.count
    };
  }
};

// Initialize database on module load
initializeDatabase();