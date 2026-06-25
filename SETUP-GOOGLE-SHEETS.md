# Google Sheets Integration Setup Guide

## Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "AI Ready Engineers Forms")
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 2: Create a Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in:
   - Name: `sheets-writer`
   - Role: `Editor`
4. Click "Create and Continue"
5. Click "Done"
6. Click on the service account you just created
7. Go to "Keys" tab > "Add Key" > "Create new key"
8. Choose "JSON" and download the key file

## Step 3: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it "AI Ready Engineers - Form Submissions"
4. Add these column headers in Row 1:
   ```
   A1: Timestamp
   B1: Name
   C1: Email
   D1: Phone
   E1: Course/Subject
   F1: Experience
   G1: Message
   H1: Form Type
   ```
5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

## Step 4: Share the Sheet with Service Account
1. Open your Google Sheet
2. Click "Share"
3. Add the service account email (from the JSON file, looks like `sheets-writer@your-project.iam.gserviceaccount.com`)
4. Give it "Editor" access
5. Click "Send"

## Step 5: Set Netlify Environment Variables
1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" > "Environment variables"
4. Add these variables:

| Variable | Value |
|----------|-------|
| `GOOGLE_SPREADSHEET_ID` | The ID from Step 3 |
| `GOOGLE_SHEET_NAME` | `Sheet1` (or your sheet name) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | From the JSON file |
| `GOOGLE_PRIVATE_KEY` | From the JSON file (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`) |

**Important:** When pasting the PRIVATE_KEY, make sure newlines are preserved. In Netlify, paste it as-is.

## Step 6: Redeploy
After setting environment variables, trigger a new deploy:
- Go to "Deploys" > "Trigger deploy" > "Deploy site"

## Testing
1. Fill out the enrollment form on your site
2. Check your Google Sheet - a new row should appear
3. Check Netlify Function logs for any errors

## Troubleshooting
- **403 error**: Service account doesn't have access to the sheet. Re-share the sheet.
- **401 error**: Private key is incorrect or has wrong formatting.
- **No data**: Check Netlify Function logs in the dashboard.

## Local Development
For local testing, create a `.env` file in the project root:
```
GOOGLE_SPREADSHEET_ID=your_id_here
GOOGLE_SHEET_NAME=Sheet1
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"
```

Note: Netlify Functions require the `netlify-cli` for local testing:
```bash
npx netlify-cli dev
```
