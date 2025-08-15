const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function getGoogleSheetsClient() {
    try {

        const credentials = {
            type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLIENT_ID,
            auth_uri: process.env.GOOGLE_AUTH_URI,
            token_uri: process.env.GOOGLE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
        };

        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: SCOPES,
        });
        const authClient = await auth.getClient();
        return google.sheets({ version: 'v4', auth: authClient });
    } catch (error) {
        console.error('Error setting up Google Sheets client:', error);
        throw new Error('Failed to authenticate with Google Sheets API.');
    }
}

async function checkEmailInSheet(email) {
    if (!process.env.SPREADSHEET_ID || !process.env.SHEET_NAME) {
        console.error("SPREADSHEET_ID or SHEET_NAME environment variables not set.");
        return false;
    }

    try {
        const sheets = await getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,

            range: `${process.env.SHEET_NAME}!A:A`,
        });

        const rows = response.data.values;
        if (rows && rows.length) {

            return rows.flat().includes(email);
        } else {
            console.log('No data found in the spreadsheet.');
            return false;
        }
    } catch (err) {
        console.error('The API returned an error: ' + err);
        return false;
    }
}

module.exports = { checkEmailInSheet };
