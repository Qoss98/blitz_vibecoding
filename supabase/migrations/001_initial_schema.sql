-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Talent Managers table (for future auth, but needed now for references)
CREATE TABLE IF NOT EXISTS talent_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'talent_manager',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table (one per trainee)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainee_email TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  talent_manager_id UUID REFERENCES talent_managers(id) ON DELETE SET NULL,
  cohort TEXT,
  remarks TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Days table (one row per day)
CREATE TABLE IF NOT EXISTS training_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_weekend BOOLEAN NOT NULL DEFAULT false,
  subject TEXT,
  modality TEXT CHECK (modality IN ('', 'Op locatie', 'Online', 'Custom')),
  trainer TEXT,
  short_description TEXT,
  notes TEXT,
  custom_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, date)
);

-- Training Templates table (reusable templates)
CREATE TABLE IF NOT EXISTS training_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT,
  modality TEXT CHECK (modality IN ('', 'Op locatie', 'Online', 'Custom')),
  trainer TEXT,
  short_description TEXT,
  notes TEXT,
  custom_location TEXT,
  created_by UUID REFERENCES talent_managers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_programs_talent_manager ON programs(talent_manager_id);
CREATE INDEX IF NOT EXISTS idx_training_days_program ON training_days(program_id);
CREATE INDEX IF NOT EXISTS idx_training_days_date ON training_days(date);
CREATE INDEX IF NOT EXISTS idx_training_templates_created_by ON training_templates(created_by);

-- Row Level Security (RLS) - disabled for now, will be enabled with auth
ALTER TABLE talent_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_templates ENABLE ROW LEVEL SECURITY;

-- Temporary policies: allow all operations (will be restricted when auth is added)
CREATE POLICY "Allow all for talent_managers" ON talent_managers FOR ALL USING (true);
CREATE POLICY "Allow all for programs" ON programs FOR ALL USING (true);
CREATE POLICY "Allow all for training_days" ON training_days FOR ALL USING (true);
CREATE POLICY "Allow all for training_templates" ON training_templates FOR ALL USING (true);

