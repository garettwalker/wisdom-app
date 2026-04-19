# Journal Feature Summary

## Data Model

I used the **existing `user_progress` table** with added columns:

```sql
-- Added columns:
journal_entry TEXT           -- The user's reflection
completed_at TIMESTAMP       -- When journal was saved (marks completion)
updated_at TIMESTAMP         -- Auto-updated on edits
```

**Why not a new table?**
- One-to-one relationship: Each day completed = one journal entry
- Atomic: Journal save = day marked complete (single operation)
- Simpler queries: No JOINs needed to show journal with progress
- Existing RLS policies already protect the data

---

## Files Changed

### New Files
| File | Purpose |
|------|---------|
| `app/journal.tsx` | Journal entry screen (shown after session) |
| `supabase-migration.sql` | Migration for existing databases |
| `JOURNAL_FEATURE.md` | This documentation |

### Modified Files
| File | Changes |
|------|---------|
| `supabase-schema.sql` | Updated schema with journal columns |
| `app/session.tsx` | Navigates to `/journal` when timer ends |
| `app/(tabs)/calendar.tsx` | Shows journal preview for completed days |
| `app/_layout.tsx` | Registered `/journal` route |

---

## Testing the Full Flow

### Step 1: Update Database

Run the migration in your Supabase SQL Editor:

```sql
-- Option A: Fresh install - run full schema
-- Copy contents of supabase-schema.sql

-- Option B: Existing project - run migration
-- Copy contents of supabase-migration.sql
```

### Step 2: Test the Flow

1. **Start a session:**
   ```bash
   npx expo start
   ```
   - Go to Calendar → Select a day → "Start Session"

2. **Complete the timer:**
   - Wait for timer to reach 0 (or modify `startSeconds` for testing)
   - When timer ends, app auto-navigates to journal screen

3. **Write a reflection:**
   - Screen shows: Day number, anchor word
   - Text box with prompt: "What did you hear, feel, or sense?"
   - Type your reflection
   - Tap "Complete Day"

4. **Verify saved:**
   - App redirects to Calendar
   - Selected day shows "Completed"
   - Journal preview appears with your entry
   - Small dot (●) appears next to days with journals in the list

5. **View later:**
   - Navigate to any completed day in calendar
   - Journal entry displays in the feature card

---

## User Flow

```
Session Timer Ends
       ↓
   Journal Screen
   - Day + Anchor shown
   - Reflection prompt
   - Text input
       ↓
   User writes + saves
       ↓
   Saved to Supabase:
   - journal_entry
   - completed_at (marks complete)
       ↓
   Calendar (redirect)
   - Day marked ✓
   - Journal preview shown
```

---

## Security

Row Level Security ensures:
- Users can only view their own journal entries
- Users can only edit their own entries
- `auth.uid() = user_id` enforced on all operations

---

## Future Enhancements (Optional)

- **Edit journal**: Long-press completed day to edit
- **Export journals**: Download all reflections as PDF/text
- **Search**: Find entries by keyword
- **Streak view**: Show consecutive days with journals
- **Share**: Export individual entries to share
