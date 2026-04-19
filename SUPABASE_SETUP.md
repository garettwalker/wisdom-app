# Supabase Setup Guide

Follow these steps to set up authentication and cloud-synced progress for your Desert app.

## Step 1: Create a Supabase Project

1. Go to https://supabase.com
2. Click "Start your project" or "New Project"
3. Sign in or create an account
4. Create a new project:
   - **Name**: desert-app (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest to your users
   - **Pricing Plan**: Free tier is sufficient

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Update Your App Configuration

Edit `lib/supabase.ts` and replace the placeholders:

```typescript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL

This creates:
- `profiles` table (linked to auth.users)
- `user_progress` table (stores completed days)
- Row Level Security policies (users can only access their own data)
- Auto-create profile trigger (profiles created on signup)

## Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email settings:
   - For development: Disable email confirmation (Settings → Email Templates)
   - For production: Configure SMTP or use Supabase's email service

## Step 6: Test the App

```bash
npx expo start
```

Try these flows:
1. **Sign Up**: Create a new account with email/password
2. **Complete a session**: Start a day and let the timer finish
3. **Check progress**: Go to Calendar - you should see the day marked complete
4. **Sign Out**: Go to Settings → Sign Out
5. **Sign In**: Log back in - your progress should still be there

## Step 7: Production Considerations

Before launching:

1. **Email Confirmation**: Re-enable email confirmation for security
2. **Password Policies**: Set minimum password length in Auth → Policies
3. **Rate Limiting**: Configure rate limits in Auth → Settings
4. **Backup**: Set up automated database backups (Settings → Database)
5. **Monitoring**: Enable Supabase logs and alerts

## Troubleshooting

### "Invalid supabaseUrl" error
Make sure the URL includes `https://` and ends with `.supabase.co`

### "User already registered" error
The email is already in use. Try signing in instead of signing up.

### Progress not saving
Check that:
- You're logged in (check Settings screen shows your email)
- The database schema was created correctly
- Row Level Security policies are enabled

### Can't see my data in Supabase dashboard
Go to **Database** → **Tables** and check:
- `profiles` table has your user
- `user_progress` table has your completed days

## Free Tier Limits

Supabase free tier includes:
- 50,000 monthly active users
- 500MB database storage
- 2GB bandwidth/month
- Unlimited API requests

This is plenty for a meditation app with text-based progress tracking!
