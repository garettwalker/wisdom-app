# Timer Features: Keep Awake + Chime Sound

## What Was Added

### 1. Keep Screen Awake During Session
The screen will stay on during the meditation session so you don't need to touch your device.

**Behavior:**
- Activates when session timer starts
- Deactivates when timer completes or user leaves screen
- Uses `expo-keep-awake` (Expo's official solution)

### 2. Chime Sound When Timer Completes
A gentle chime plays when the meditation session ends.

**Behavior:**
- Plays exactly when timer reaches zero
- Continues playing as UI transitions to journal screen
- Uses `expo-av` (Expo's official audio API)
- Sound file bundled locally: `assets/sounds/chime.wav`

---

## Packages Installed

```bash
npm install expo-keep-awake expo-av
```

Both are official Expo modules with full iOS/Android/web support.

---

## Files Changed

### `app/session.tsx`

**Added imports:**
```typescript
import { activateKeepAwakeAsync, deactivateKeepAwakeAsync } from 'expo-keep-awake';
import { Audio } from 'expo-av';
```

**Added state:**
```typescript
const soundRef = useRef<Audio.Sound | null>(null);
const [isTimerRunning, useState(true);
```

**Added `playChime` function:**
```typescript
const playChime = useCallback(async () => {
  try {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/chime.wav'),
      { volume: 1.0 }
    );

    soundRef.current = sound;
    await sound.playAsync();
  } catch (e) {
    console.log('Error playing chime:', e);
  }
}, []);
```

**Modified `startTimer`:**
- Sets `isTimerRunning(true)` when starting
- Calls `playChime()` when timer completes
- Sets `isTimerRunning(false)` when done

**Added keep-awake effect:**
```typescript
useEffect(() => {
  let activated = false;

  const activateAwake = async () => {
    if (isTimerRunning) {
      try {
        await activateKeepAwakeAsync();
        activated = true;
      } catch (e) {
        console.log('Error activating keep-awake:', e);
      }
    }
  };

  activateAwake();

  return () => {
    if (activated) {
      deactivateKeepAwakeAsync();
    }
  };
}, [isTimerRunning]);
```

**Added sound cleanup effect:**
```typescript
useEffect(() => {
  return () => {
    if (soundRef.current) {
      soundRef.current.unloadAsync();
    }
  };
}, []);
```

### `app.json`

**Added asset bundling:**
```json
"assetBundlePatterns": [
  "**/*"
]
```

This ensures the chime sound is bundled with the app.

### New Files

| File | Purpose |
|------|---------|
| `assets/sounds/chime.wav` | 523Hz chime sound (C5 note, 0.5s decay) |
| `TIMER_FEATURES.md` | This documentation |

---

## Testing

1. **Start a session:**
   ```bash
   npx expo start
   ```

2. **Test keep-awake:**
   - Start any session
   - Lock your device normally (don't touch screen)
   - Screen should stay on during the timer
   - When timer ends, screen can sleep normally

3. **Test chime:**
   - Start a session with short duration (modify `duration` param for testing)
   - Wait for timer to complete
   - Chime should play as screen transitions to journal

4. **Test cleanup:**
   - Start a session
   - Navigate away before timer ends
   - Keep-awake should deactivate
   - No sound should play

---

## Technical Details

### Keep-Awake
- Uses `activateKeepAwakeAsync()` from `expo-keep-awake`
- Only active while `isTimerRunning` is true
- Properly cleaned up on:
  - Timer completion
  - Component unmount
  - Navigation away from screen

### Audio
- Uses `Audio.Sound.createAsync()` from `expo-av`
- Sound loaded from local file (`require()`)
- Volume set to 1.0 (full volume)
- Sound reference stored in `useRef` for cleanup
- Properly unloaded on:
  - Component unmount
  - New sound playback (prevents memory leaks)

### Chime Sound
- Generated programmatically (no copyright issues)
- 523.25 Hz sine wave (C5 musical note)
- 0.5 second duration
- Exponential decay envelope for "chime" quality
- WAV format (44.1kHz, 16-bit, mono)

---

## Troubleshooting

### Sound doesn't play
- Check device volume is up
- Ensure not in silent mode
- Verify `chime.wav` exists in `assets/sounds/`

### Screen still sleeps
- Check `expo-keep-awake` is installed
- Verify timer is actually running (not paused)
- Check console for "Error activating keep-awake" messages

### Sound continues after leaving screen
- Should not happen (cleanup effect handles this)
- If it does, check console for errors
- Sound reference may not be cleaning up properly

---

## Future Enhancements (Optional)

- **Volume control**: Settings slider for chime volume
- **Different sounds**: Multiple chime options
- **Vibration**: Haptic feedback when timer ends
- **Silent mode**: Option to disable chime
- **Fade out**: Timer sound that gradually fades in last 10 seconds
