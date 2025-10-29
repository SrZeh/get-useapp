# State Management Guide

This document describes the centralized state management patterns and best practices used throughout the application.

## Overview

The app uses React Context API with custom hooks for state management. All state management utilities are centralized to ensure consistency and maintainability.

## Core Principles

1. **Centralized State**: Global state in Context providers
2. **Reusable Hooks**: Common patterns extracted into custom hooks
3. **Optimized Re-renders**: Memoized context values and callbacks
4. **Error Handling**: Proper error states in all async operations
5. **Type Safety**: Full TypeScript support for all state

## Context Providers

### ThemeProvider

Manages theme mode (light, dark, system) and color scheme.

**Location**: `providers/ThemeProvider.tsx`

**Features**:
- ✅ System theme listener (reacts to OS theme changes)
- ✅ Persists theme preference to AsyncStorage
- ✅ Memoized context value to prevent re-renders
- ✅ Loading state during initialization
- ✅ Error handling

**Usage**:
```tsx
import { useTheme } from '@/providers/ThemeProvider';

function MyComponent() {
  const { themeMode, colorScheme, setThemeMode, isLoading } = useTheme();
  
  return (
    <View>
      <Button onPress={() => setThemeMode('dark')}>Dark Mode</Button>
    </View>
  );
}
```

### AuthProvider

Manages authentication state.

**Location**: `src/providers/AuthProvider.tsx`

**Features**:
- ✅ Firebase auth state listener
- ✅ Error state handling
- ✅ Loading state
- ✅ Manual refresh capability
- ✅ Memoized context value

**Usage**:
```tsx
import { useAuth } from '@/src/providers/AuthProvider';

function MyComponent() {
  const { user, loadingUser, error, refreshAuth } = useAuth();
  
  if (loadingUser) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!user) return <LoginScreen />;
  
  return <Dashboard user={user} />;
}
```

### CoachmarksProvider

Manages onboarding coachmarks state.

**Location**: `providers/CoachmarksProvider.tsx`

**Usage**:
```tsx
import { useCoachmarksContext } from '@/providers/CoachmarksProvider';

function MyComponent() {
  const { start, stop, next } = useCoachmarksContext();
  
  return <Button onPress={() => start(steps)}>Show Tour</Button>;
}
```

### OnboardingProvider

Manages onboarding visibility.

**Location**: `providers/OnboardingProvider.tsx`

## Reusable Hooks

### useAsync

Handles async operations with loading, error, and data states.

**Location**: `hooks/useAsync.ts`

**Usage**:
```tsx
import { useAsync } from '@/hooks/useAsync';

function DataComponent() {
  const { data, loading, error, execute, reset } = useAsync(
    async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
    {
      immediate: true, // Auto-execute on mount
      onSuccess: (data) => console.log('Success:', data),
      onError: (err) => console.error('Error:', err),
    }
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  return <DataDisplay data={data} />;
}
```

### useLocalStorage

Syncs state with AsyncStorage.

**Location**: `hooks/useLocalStorage.ts`

**Usage**:
```tsx
import { useLocalStorage } from '@/hooks/useLocalStorage';

function SettingsComponent() {
  const [theme, setTheme, loading] = useLocalStorage('theme', 'system');
  
  return (
    <Picker
      selectedValue={theme}
      onValueChange={setTheme}
      disabled={loading}
    >
      <Picker.Item label="System" value="system" />
      <Picker.Item label="Light" value="light" />
      <Picker.Item label="Dark" value="dark" />
    </Picker>
  );
}
```

### usePrevious

Tracks previous value for comparison.

**Location**: `hooks/usePrevious.ts`

**Usage**:
```tsx
import { usePrevious } from '@/hooks/usePrevious';

function CounterComponent() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  
  useEffect(() => {
    if (prevCount !== undefined && prevCount !== count) {
      console.log(`Count changed from ${prevCount} to ${count}`);
    }
  }, [count, prevCount]);
  
  return <Text>{count}</Text>;
}
```

## State Utilities

### useDebouncedCallback

Debounces function calls to prevent excessive executions.

**Location**: `utils/state.ts`

**Usage**:
```tsx
import { useDebouncedCallback } from '@/utils/state';

function SearchComponent() {
  const debouncedSearch = useDebouncedCallback((query: string) => {
    performSearch(query);
  }, 300);
  
  return (
    <TextInput
      onChangeText={debouncedSearch}
      placeholder="Search..."
    />
  );
}
```

### useThrottledCallback

Throttles function calls to limit execution frequency.

**Location**: `utils/state.ts`

**Usage**:
```tsx
import { useThrottledCallback } from '@/utils/state';

function ScrollComponent() {
  const throttledScroll = useThrottledCallback((event: ScrollEvent) => {
    updateScrollPosition(event);
  }, 100);
  
  return (
    <ScrollView onScroll={throttledScroll}>
      {/* content */}
    </ScrollView>
  );
}
```

### useLatestRef

Accesses latest value in callbacks without dependency issues.

**Location**: `utils/state.ts`

**Usage**:
```tsx
import { useLatestRef } from '@/utils/state';

function TimerComponent() {
  const [count, setCount] = useState(0);
  const countRef = useLatestRef(count);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Always uses latest count value
      console.log('Current count:', countRef.current);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // No count dependency needed
}
```

## Best Practices

### 1. Memoize Context Values

Always memoize context values to prevent unnecessary re-renders:

```tsx
const value = useMemo(
  () => ({ user, loading, error }),
  [user, loading, error]
);
```

### 2. Use Callbacks for Functions

Memoize functions passed to context:

```tsx
const setTheme = useCallback(async (mode: ThemeMode) => {
  await AsyncStorage.setItem('theme', mode);
  setThemeMode(mode);
}, []);
```

### 3. Handle Loading States

Always provide loading states for async operations:

```tsx
const { data, loading, error } = useAsync(fetchData);
if (loading) return <Loading />;
if (error) return <Error />;
```

### 4. Cleanup Subscriptions

Always clean up subscriptions and listeners:

```tsx
useEffect(() => {
  const unsubscribe = subscribe();
  return () => unsubscribe();
}, []);
```

### 5. Check Mounted State

Prevent state updates after unmount:

```tsx
useEffect(() => {
  let isMounted = true;
  
  async function load() {
    const data = await fetchData();
    if (isMounted) setData(data);
  }
  
  load();
  return () => { isMounted = false; };
}, []);
```

## Migration Guide

### Before (Basic State)

```tsx
function Component() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  // ...
}
```

### After (useAsync Hook)

```tsx
function Component() {
  const { data, loading, error, execute } = useAsync(fetchData, {
    immediate: true,
  });
  
  // ...
}
```

## Performance Optimization

### Prevent Unnecessary Re-renders

1. **Memoize Context Values**: Use `useMemo` for context provider values
2. **Memoize Callbacks**: Use `useCallback` for functions in context
3. **Split Contexts**: Separate frequently changing values from stable ones
4. **Use selectors**: Only subscribe to needed values (future enhancement)

### Example: Optimized Provider

```tsx
export function OptimizedProvider({ children }) {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  
  // Memoize callbacks
  const updateState1 = useCallback((value) => {
    setState1(value);
  }, []);
  
  // Memoize context value
  const value = useMemo(() => ({
    state1,
    state2,
    updateState1,
  }), [state1, state2, updateState1]);
  
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
```

## Error Handling

All providers and hooks include proper error handling:

1. **Try-catch blocks** in async operations
2. **Error states** in context values
3. **Error logging** using the logger utility
4. **User-friendly error messages**

## Testing State

When testing components that use state:

1. Mock context providers
2. Test loading and error states
3. Verify state updates
4. Test cleanup and unmounting

