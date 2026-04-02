import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export const getSheetsClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      // Handle newline escaping for private key
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
};

export const SPREADSHEET_ID = '1HQHxrqBQjNa6leaTjQ2SKtp1aPP410YZUdCMePy_5Fw';
export const SHEET_NAME = 'Sheet1'; // Change this if your sheet has a different name
