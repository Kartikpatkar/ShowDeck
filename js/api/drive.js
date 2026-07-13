/**
 * ShowDeck — Google Drive API Wrapper
 * Handles OAuth2 implicit flow and Drive REST API calls for the hidden appDataFolder.
 */

// IMPORTANT: Replace this with your actual Google Cloud Client ID
export const GOOGLE_CLIENT_ID = '30353813309-2hatq9tn7aofq8krtt1hv1o7369m4n2q.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

let tokenClient = null;
let currentAccessToken = null;

/**
 * Dynamically loads the Google Identity Services script.
 */
function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Initializes the OAuth client. Must be called before backup/restore.
 */
export async function initDrive() {
  await loadGsiScript();

  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: '' // Will be overridden per-request
    });
  }
}

/**
 * Checks if we currently have an access token in memory.
 */
export function isDriveSignedIn() {
  return localStorage.getItem('showdeck_drive_linked') === 'true' || currentAccessToken !== null;
}

/**
 * Revokes the token and clears it from memory.
 */
export function signOutDrive() {
  return new Promise((resolve) => {
    localStorage.removeItem('showdeck_drive_linked');
    localStorage.removeItem('showdeck_drive_token');
    localStorage.removeItem('showdeck_drive_token_expiry');
    
    const tokenToRevoke = currentAccessToken || localStorage.getItem('showdeck_drive_token');
    
    if (tokenToRevoke && window.google) {
      window.google.accounts.oauth2.revoke(tokenToRevoke, () => {
        currentAccessToken = null;
        resolve();
      });
    } else {
      currentAccessToken = null;
      resolve();
    }
  });
}

/**
 * Prompts the user for authentication and returns an access token.
 */
function authenticate() {
  return new Promise((resolve, reject) => {
    if (currentAccessToken) {
      resolve(currentAccessToken);
      return;
    }

    const savedToken = localStorage.getItem('showdeck_drive_token');
    const expiry = localStorage.getItem('showdeck_drive_token_expiry');
    if (savedToken && expiry && Date.now() < parseInt(expiry, 10)) {
      currentAccessToken = savedToken;
      resolve(savedToken);
      return;
    }

    try {
      tokenClient.callback = (resp) => {
        if (resp.error !== undefined) {
          reject(new Error(resp.error));
          return;
        }
        currentAccessToken = resp.access_token;
        localStorage.setItem('showdeck_drive_linked', 'true');
        localStorage.setItem('showdeck_drive_token', currentAccessToken);
        localStorage.setItem('showdeck_drive_token_expiry', Date.now() + (resp.expires_in * 1000));
        resolve(resp.access_token);
      };
      
      tokenClient.error_callback = (err) => {
        reject(new Error(err.type || 'Authentication failed or popup closed'));
      };

      // Request access token with popup
      tokenClient.requestAccessToken({ prompt: '' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Explicit sign-in function.
 */
export async function signInDrive() {
  return await authenticate();
}

/**
 * Finds the backup file ID in the appDataFolder.
 */
async function findBackupFileId(token) {
  const query = encodeURIComponent("name='showdeck_backup.json'");
  const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id)`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to search drive');
  const data = await res.json();

  if (data.files && data.files.length > 0) {
    return data.files[0].id; // Return the first matched file ID
  }
  return null;
}

/**
 * Creates an empty file in the appDataFolder.
 */
async function createEmptyBackupFile(token) {
  const metadata = {
    name: 'showdeck_backup.json',
    parents: ['appDataFolder']
  };

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!res.ok) throw new Error('Failed to create file metadata in Drive');
  const data = await res.json();
  return data.id;
}

/**
 * Uploads the actual JSON data to a specific file ID.
 */
async function uploadDataToFile(token, fileId, jsonData) {
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonData)
  });

  if (!res.ok) throw new Error('Failed to upload data to Drive');
  return await res.json();
}

/**
 * Main Backup function. Finds existing file or creates one, then uploads data.
 */
export async function backupToDrive(jsonData) {
  const token = await authenticate();
  let fileId = await findBackupFileId(token);

  if (!fileId) {
    fileId = await createEmptyBackupFile(token);
  }

  await uploadDataToFile(token, fileId, jsonData);
}

/**
 * Main Restore function. Finds file and downloads data.
 */
export async function restoreFromDrive() {
  const token = await authenticate();
  const fileId = await findBackupFileId(token);

  if (!fileId) {
    return null; // Gracefully return null if no backup exists
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to download backup from Drive');
  return await res.json();
}

/**
 * Deletes the backup file from the appDataFolder.
 */
export async function clearDriveData() {
  const token = await authenticate();
  const fileId = await findBackupFileId(token);

  if (!fileId) {
    throw new Error('No backup found in Google Drive to delete.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to delete backup from Drive');
  return true;
}
