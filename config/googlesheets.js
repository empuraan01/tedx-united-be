const { google } = require('googleapis');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const KEY_FILE_PATH = path.join(__dirname, 'credentials.json');

async function getGoogleSheetsClient() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
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
