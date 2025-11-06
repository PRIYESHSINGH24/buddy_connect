# Environment variables and local setup

This project requires a MongoDB connection string in the `MONGODB_URI` environment variable at runtime.

## Use .env.local (recommended for local development)

1. Copy `.env.local.example` to `.env.local` at the project root.
2. Replace the placeholder value with your real connection string. Example:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/my-database?retryWrites=true&w=majority"
```

3. Do NOT commit `.env.local` to version control.

## PowerShell commands

Set the variable for the current PowerShell session only (temporary):

```powershell
$env:MONGODB_URI = 'mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/my-database?retryWrites=true&w=majority'
pnpm dev
```

Set the variable persistently for the current user (requires opening a new terminal afterwards):

```powershell
setx MONGODB_URI 'mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/my-database?retryWrites=true&w=majority'
# Open a new terminal before running the dev server
pnpm dev
```

## Deployments

For Vercel, Netlify, Render, or similar providers, add `MONGODB_URI` in the project's Environment Variables / Secrets settings (Preview/Production as needed).

If the server logs an error mentioning `MONGODB_URI` is missing, double-check that the environment variable is defined in the environment where the server process runs (local shell, or your hosting provider's env settings). See `.env.local.example` for a template.
