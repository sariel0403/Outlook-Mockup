// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const config = {
  appId: '3cf476da-a75d-4767-a024-4af6df349dd0',
  // authority: 'https://login.microsoftonline.com/common',
  redirectUri: 'http://localhost:3000',
  scopes: [
    'user.read',
    'mailboxsettings.read',
    'calendars.read',
    'mail.read',
    'mail.send'
  ]
};

export default config;
