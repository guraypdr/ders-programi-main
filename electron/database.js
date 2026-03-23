const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

let db = null

function getDbPath() {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'ders-programi.db')
}

function initDatabase() {
  if (db) return db
  
  const dbPath = getDbPath()
  db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  
  createTables()
  
  return db
}

function createTables() {
  // Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      school_type TEXT,
      school_name TEXT,
      principal_name TEXT,
      daily_lesson_hours INTEGER DEFAULT 8,
      lesson_duration INTEGER DEFAULT 40,
      break_duration INTEGER DEFAULT 10,
      lunch_after_lesson INTEGER DEFAULT 4,
      lunch_duration INTEGER DEFAULT 40,
      lesson_start_time TEXT DEFAULT '08:30',
      fields TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Teachers
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      branch TEXT NOT NULL,
      phone TEXT,
      short_name TEXT NOT NULL,
      availability TEXT DEFAULT '{}',
      daily_constraints TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Teacher Duties
  db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_duties (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      name TEXT NOT NULL,
      day TEXT NOT NULL,
      slot INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    )
  `)

  // Classes
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level TEXT NOT NULL,
      field TEXT DEFAULT 'default',
      mandatory_hours INTEGER DEFAULT 0,
      elective_hours INTEGER DEFAULT 0,
      guidance_hours INTEGER DEFAULT 0,
      max_daily_hours INTEGER DEFAULT 8,
      advisor_teacher_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (advisor_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    )
  `)

  // Lessons
  db.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      branch TEXT NOT NULL,
      level TEXT NOT NULL,
      field TEXT DEFAULT 'default',
      type TEXT NOT NULL CHECK (type IN ('zorunlu', 'secmeli', 'rehberlik')),
      distribution_plan TEXT NOT NULL,
      is_staj INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Class Lessons (assignments)
  db.exec(`
    CREATE TABLE IF NOT EXISTS class_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      teacher_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
      UNIQUE(class_id, lesson_id)
    )
  `)

  // Constraints - Same Time
  db.exec(`
    CREATE TABLE IF NOT EXISTS constraints_same_time (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      lessons TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    )
  `)

  // Constraints - Different Day
  db.exec(`
    CREATE TABLE IF NOT EXISTS constraints_different_day (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      lesson1_id TEXT NOT NULL,
      lesson2_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    )
  `)

  // Constraints - Specific Days
  db.exec(`
    CREATE TABLE IF NOT EXISTS constraints_specific_days (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      allowed_days TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )
  `)

  // Generated Schedule
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id TEXT NOT NULL,
      day TEXT NOT NULL,
      slot INTEGER NOT NULL,
      lesson_id TEXT,
      teacher_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
      UNIQUE(class_id, day, slot)
    )
  `)
}

// Settings CRUD
function getSettings() {
  const stmt = db.prepare('SELECT * FROM settings WHERE id = 1')
  const row = stmt.get()
  if (row) {
    return {
      ...row,
      fields: JSON.parse(row.fields || '[]')
    }
  }
  return null
}

function saveSettings(settings) {
  const stmt = db.prepare(`
    INSERT INTO settings (id, school_type, school_name, principal_name, 
      daily_lesson_hours, lesson_duration, break_duration, lunch_after_lesson,
      lunch_duration, lesson_start_time, fields, updated_at)
    VALUES (1, @schoolType, @schoolName, @principalName, @dailyLessonHours,
      @lessonDuration, @breakDuration, @lunchAfterLesson, @lunchDuration,
      @lessonStartTime, @fields, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      school_type = @schoolType,
      school_name = @schoolName,
      principal_name = @principalName,
      daily_lesson_hours = @dailyLessonHours,
      lesson_duration = @lessonDuration,
      break_duration = @breakDuration,
      lunch_after_lesson = @lunchAfterLesson,
      lunch_duration = @lunchDuration,
      lesson_start_time = @lessonStartTime,
      fields = @fields,
      updated_at = CURRENT_TIMESTAMP
  `)
  
  stmt.run({
    ...settings,
    fields: JSON.stringify(settings.fields || [])
  })
}

// Teachers CRUD
function getTeachers() {
  const stmt = db.prepare('SELECT * FROM teachers ORDER BY branch, last_name, first_name')
  return stmt.all().map(row => ({
    ...row,
    availability: JSON.parse(row.availability || '{}'),
    dailyConstraints: JSON.parse(row.daily_constraints || '{}')
  }))
}

function saveTeacher(teacher) {
  const stmt = db.prepare(`
    INSERT INTO teachers (id, first_name, last_name, branch, phone, short_name, 
      availability, daily_constraints, updated_at)
    VALUES (@id, @firstName, @lastName, @branch, @phone, @shortName,
      @availability, @dailyConstraints, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      first_name = @firstName,
      last_name = @lastName,
      branch = @branch,
      phone = @phone,
      short_name = @shortName,
      availability = @availability,
      daily_constraints = @dailyConstraints,
      updated_at = CURRENT_TIMESTAMP
  `)
  
  stmt.run({
    ...teacher,
    availability: JSON.stringify(teacher.availability || {}),
    dailyConstraints: JSON.stringify(teacher.dailyConstraints || {})
  })
}

function deleteTeacher(id) {
  const stmt = db.prepare('DELETE FROM teachers WHERE id = ?')
  stmt.run(id)
}

// Classes CRUD
function getClasses() {
  const stmt = db.prepare('SELECT * FROM classes ORDER BY level, name')
  return stmt.all()
}

function saveClass(cls) {
  const stmt = db.prepare(`
    INSERT INTO classes (id, name, level, field, mandatory_hours, elective_hours,
      guidance_hours, max_daily_hours, advisor_teacher_id, updated_at)
    VALUES (@id, @name, @level, @field, @mandatoryHours, @electiveHours,
      @guidanceHours, @maxDailyHours, @advisorTeacherId, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = @name,
      level = @level,
      field = @field,
      mandatory_hours = @mandatoryHours,
      elective_hours = @electiveHours,
      guidance_hours = @guidanceHours,
      max_daily_hours = @maxDailyHours,
      advisor_teacher_id = @advisorTeacherId,
      updated_at = CURRENT_TIMESTAMP
  `)
  
  stmt.run(cls)
}

function deleteClass(id) {
  const stmt = db.prepare('DELETE FROM classes WHERE id = ?')
  stmt.run(id)
}

// Lessons CRUD
function getLessons() {
  const stmt = db.prepare('SELECT * FROM lessons ORDER BY level, name')
  return stmt.all().map(row => ({
    ...row,
    isStaj: Boolean(row.is_staj)
  }))
}

function saveLesson(lesson) {
  const stmt = db.prepare(`
    INSERT INTO lessons (id, name, code, branch, level, field, type,
      distribution_plan, is_staj, updated_at)
    VALUES (@id, @name, @code, @branch, @level, @field, @type,
      @distributionPlan, @isStaj, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = @name,
      code = @code,
      branch = @branch,
      level = @level,
      field = @field,
      type = @type,
      distribution_plan = @distributionPlan,
      is_staj = @isStaj,
      updated_at = CURRENT_TIMESTAMP
  `)
  
  stmt.run({
    ...lesson,
    isStaj: lesson.isStaj ? 1 : 0
  })
}

function deleteLesson(id) {
  const stmt = db.prepare('DELETE FROM lessons WHERE id = ?')
  stmt.run(id)
}

module.exports = {
  initDatabase,
  getSettings,
  saveSettings,
  getTeachers,
  saveTeacher,
  deleteTeacher,
  getClasses,
  saveClass,
  deleteClass,
  getLessons,
  saveLesson,
  deleteLesson
}
