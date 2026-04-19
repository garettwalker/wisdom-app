# Authentication & Cloud Sync

This app uses **Supabase** for user authentication and cloud-synced progress storage.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Login     │────▶│  AuthContext │────▶│  Supabase   │
│   Screen    │     │  (useAuth)   │     │  (Backend)  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Protected   │
                    │   Routes     │
                    └──────────────┘
```

## File Structure

```
desert-app/
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── contexts/
│   └── AuthContext.tsx      # Auth state management (useAuth hook)
├── app/
│   ├── login.tsx            # Sign up / Sign in screen
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Auth check for tab routes
│   │   ├── home.tsx         # Protected route
│   │   ├── calendar.tsx     # Protected route (loads progress from Supabase)
│   │   └── settings.tsx     # Shows user email, logout button
│   ├── onboarding.tsx       # Protected route (instructions)
│   ├── session.tsx          # Protected route (saves progress to Supabase)
│   └── _layout.tsx          # Root layout with AuthProvider
├── supabase-schema.sql      # Database schema (run in Supabase SQL Editor)
├── SUPABASE_SETUP.md        # Step-by-step setup guide
└── .env.example             # Environment variable template
```

## Key Features

### Authentication
- Email/password sign up and sign in
- Persistent sessions (auto-login on app restart)
- Protected routes redirect to login if not authenticated

### Progress Sync
- Completed days stored in `user_progress` table
- Syncs across devices automatically
- Offline support (queues changes when online)

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Password requirements: minimum 6 characters

## Usage

### Check if user is logged in
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <LoginPrompt />;
  
  return <Text>Welcome, {user.email}!</Text>;
}
```

### Save progress
```typescript
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function SessionScreen() {
  const { user } = useAuth();
  
  const saveProgress = async (dayNumber: number) => {
    await supabase.from('user_progress').upsert({
      user_id: user.id,
      day_number: dayNumber,
      session_duration: 300,
      completed_at: new Date().toISOString(),
    });
  };
}
```

### Sign out
```typescript
import { useAuth } from '../contexts/AuthContext';

function SettingsScreen() {
  const { signOut } = useAuth();
  
  return (
    <Button 
      title="Sign Out" 
      onPress={() => signOut()} 
    />
  );
}
```

## Database Schema

See `supabase-schema.sql` for the full schema. Key tables:

### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | References auth.users |
| email | text | User's email |
| created_at | timestamp | Account creation date |
| updated_at | timestamp | Last profile update |

### `user_progress`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Unique progress entry |
| user_id | uuid | References profiles |
| day_number | integer | 1-30 |
| completed_at | timestamp | When completed |
| session_duration | integer | Seconds spent |

## Testing Without Supabase

To test the app without setting up Supabase yet:

1. The app will show an error at startup if credentials are missing
2. For a local-only version, you could:
   - Comment out the AuthProvider in `_layout.tsx`
   - Remove auth checks from screens
   - Revert to AsyncStorage for progress

But for production, Supabase is the recommended approach!
