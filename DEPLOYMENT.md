# Firebase Deployment Guide

This guide covers deploying all Firebase services for the GetAndUseApp project.

## Prerequisites

1. **Firebase CLI installed globally:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged in to Firebase:**
   ```bash
   firebase login
   ```

3. **Verify your project:**
   - Current project: `upperreggae` (configured in `.firebaserc`)
   - To switch projects: `firebase use <project-id>`
   - To list available projects: `firebase projects:list`

## Deployment Options

### Option 1: Deploy Everything

Deploy all services (Functions, Firestore Rules, Firestore Indexes, and Hosting):

```bash
firebase deploy
```

This will:
- Build and deploy Firebase Cloud Functions
- Deploy Firestore security rules
- Deploy Firestore indexes
- Deploy web hosting (if `dist` folder exists)

### Option 2: Deploy Individual Services

#### Deploy Firestore Rules and Indexes

Deploy security rules and indexes for the `appdb` database:

```bash
firebase deploy --only firestore
```

Or separately:
```bash
# Rules only
firebase deploy --only firestore:rules

# Indexes only
firebase deploy --only firestore:indexes
```

#### Deploy Cloud Functions

Build and deploy all Firebase Cloud Functions:

```bash
firebase deploy --only functions
```

This will:
1. Run lint (`npm run lint` in functions directory)
2. Build TypeScript (`npm run build` in functions directory)
3. Deploy all functions to Firebase

To deploy a specific function:
```bash
firebase deploy --only functions:functionName
```

#### Deploy Web Hosting

**Step 1: Build the web app**
```bash
npm run build:web
```
This runs `expo export --platform web` which creates the `dist` folder.

**Step 2: Deploy to Firebase Hosting**
```bash
firebase deploy --only hosting
```

Or use the convenience script:
```bash
npm run deploy:web
```

This automatically builds and deploys the web app.

### Option 3: Deploy Multiple Specific Services

```bash
# Deploy functions and firestore only
firebase deploy --only functions,firestore

# Deploy hosting and firestore only
firebase deploy --only hosting,firestore
```

## Pre-Deployment Checklist

### Before Deploying Functions

1. ✅ Ensure all dependencies are installed in `functions/`:
   ```bash
   cd functions
   npm install
   cd ..
   ```

2. ✅ Build functions locally to check for errors:
   ```bash
   cd functions
   npm run build
   cd ..
   ```

3. ✅ Test functions locally (optional):
   ```bash
   cd functions
   npm run serve
   cd ..
   ```

### Before Deploying Hosting

1. ✅ Build the web app:
   ```bash
   npm run build:web
   ```

2. ✅ Verify `dist` folder exists and contains the build

3. ✅ Test locally (optional):
   ```bash
   npm run web
   ```

### Before Deploying Firestore

1. ✅ Review `firestore.appdb.rules` for security
2. ✅ Review `firestore.appdb.indexes.json` for required indexes

## Common Deployment Commands

```bash
# Deploy everything
firebase deploy

# Deploy only what changed
firebase deploy --only functions,firestore,hosting

# Deploy with debug info
firebase deploy --debug

# Deploy to a different project
firebase use <project-id>
firebase deploy

# View deployment history
firebase hosting:clone <site-id>
```

## Environment Variables

### Cloud Functions

If your functions need environment variables, use:

```bash
firebase functions:config:set stripe.secret_key="sk_..."
firebase functions:config:set stripe.publishable_key="pk_..."
```

Then access in code:
```typescript
const config = functions.config();
const secretKey = config.stripe.secret_key;
```

**Note:** For newer Firebase projects, use environment variables directly:
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
```

### Web Hosting

Environment variables for the web app should be handled through:
- Expo `.env` files (not committed)
- Or embedded during build with `expo export`

## Troubleshooting

### Functions Build Fails

1. Check TypeScript errors:
   ```bash
   cd functions
   npm run build
   ```

2. Check linting errors:
   ```bash
   cd functions
   npm run lint
   ```

3. Ensure Node.js version matches (project requires Node 22):
   ```bash
   node --version  # Should be 22.x
   ```

### Hosting Build Fails

1. Check Expo build:
   ```bash
   npm run build:web
   ```

2. Verify `dist` folder is created and not empty

3. Check for build errors in the console

### Firestore Deployment Issues

1. Validate rules syntax:
   ```bash
   firebase firestore:rules:validate
   ```

2. Check indexes are not already created (duplicates cause errors)

## Deployment Best Practices

1. **Always test locally first** - Use Firebase Emulators
2. **Deploy functions first** - If your web app depends on functions
3. **Deploy rules carefully** - Bad rules can lock you out
4. **Use deployment previews** - Firebase Hosting supports previews
5. **Monitor after deployment** - Check function logs and hosting analytics

## CI/CD Integration

You can integrate Firebase deployment into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Deploy to Firebase
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: '${{ secrets.GITHUB_TOKEN }}'
    firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
    projectId: upperreggae
```

## Resources

- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Functions Deployment](https://firebase.google.com/docs/functions/manage-functions)
- [Firestore Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Hosting Deployment](https://firebase.google.com/docs/hosting/deploying)

## Quick Reference

| Service | Command | Files |
|---------|---------|-------|
| Functions | `firebase deploy --only functions` | `functions/src/` |
| Firestore Rules | `firebase deploy --only firestore:rules` | `firestore.appdb.rules` |
| Firestore Indexes | `firebase deploy --only firestore:indexes` | `firestore.appdb.indexes.json` |
| Hosting | `npm run deploy:web` | `dist/` (generated) |

---

**Current Project:** `upperreggae`  
**Project ID:** Configured in `.firebaserc`

