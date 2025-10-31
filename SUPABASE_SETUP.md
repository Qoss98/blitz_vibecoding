# Supabase Setup Guide

## Prerequisites
- An empty Supabase project (already created)

## Setup Steps

### 1. Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

### 2. Create Environment File
Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run Database Migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run it in the SQL Editor
4. This creates all necessary tables:
   - `talent_managers` (for future auth)
   - `programs` (one per trainee)
   - `training_days` (one row per day)
   - `training_templates` (reusable templates)

### 4. Create Initial Talent Manager (Optional)
If you want to test with a talent manager ID, you can insert one manually:

```sql
INSERT INTO talent_managers (email, name, role)
VALUES ('manager@example.com', 'John Doe', 'talent_manager')
RETURNING id;
```

Use the returned `id` as the talent manager ID when testing.

### 5. Restart Dev Server
After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Features Implemented

✅ **Supabase Integration**
- Replaces localStorage with Supabase persistence
- Automatic fallback to localStorage if Supabase not configured

✅ **Holiday Detection**
- Uses free API (date.nager.at) for Dutch holidays
- Automatically marks holidays as non-training days (greyed out like weekends)

✅ **Training Templates**
- Save current day fields as reusable templates
- Select templates to quickly fill days
- Manage (view/delete) templates
- Templates are scoped to talent manager (optional)

✅ **Database Schema**
- Normalized structure (separate tables for programs, days, templates)
- UUID-based IDs
- Foreign key relationships
- Ready for future auth integration

## Notes

- If Supabase env vars are missing, the app falls back to localStorage
- All features work with or without Supabase configured
- The talent manager filtering feature is pending (marked as TODO)

