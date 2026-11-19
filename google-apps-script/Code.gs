/**
 * MY BEAUTY TRIP - Google Apps Script Web App
 * Paste into script.google.com (bound to the application spreadsheet).
 * Deploy > New deployment > Web app > Execute as Me > Anyone.
 * Set the resulting /exec URL in index.html (APPS_SCRIPT_URL).
 * This script does not publish the spreadsheet or applicants.
 */
const SPREADSHEET_ID = '1G0wn2WFwJ47e-I5rrsv2o1F69Pxn2X5_WIUREsAZE8w';
const SHEET_NAME = '신청자목록';
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!e || !e.parameter) throw Error('Missing request');
    const p = e.parameter;
    // Basic bot trap: hidden field must remain empty.
    if (p.website) return ContentService.createTextOutput('OK');
    const clean = (key, max) => String(p[key] || '').trim().slice(0, max).replace(/[\x00-\x1F]/g, ' ');
    const name = clean('name',100), nationality=clean('nationality',80),
          email=clean('email',180), contact=clean('contact',100),
          social=clean('social',50), language=clean('language',10);
    if (!name || !nationality || !email || !contact || p.consent !== 'yes' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Invalid submission');
    lock.waitLock(10000);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw Error('Sheet missing');
    // Prefix risky spreadsheet formula characters to prevent formula injection.
    const safe = v => /^[=+@\-]/.test(v) ? "'" + v : v;
    const id = 'BF-' + Utilities.formatDate(new Date(),'Asia/Seoul','yyyyMMdd') + '-' + Utilities.getUuid().slice(0,8).toUpperCase();
    sheet.appendRow([new Date(),id,safe(name),safe(nationality),safe(email),safe(contact),safe(social),safe(language),'신규','','']);
    return ContentService.createTextOutput('OK');
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('ERROR');
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}