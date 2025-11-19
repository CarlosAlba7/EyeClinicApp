/**
 * Timezone utility for converting between UTC and CST (Central Standard Time)
 * CST is UTC-6 (or UTC-5 during CDT - Central Daylight Time)
 */

/**
 * Convert a date/time from CST to UTC for database storage
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:MM format (CST)
 * @returns {object} { utcDate: 'YYYY-MM-DD', utcTime: 'HH:MM:SS' }
 */
function cstToUTC(dateStr, timeStr) {
  // Create a date object with the CST date and time
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  const cstDate = new Date(dateTimeStr);

  // Get CST offset (either -6 or -5 hours depending on DST)
  // We'll use a consistent -6 hours (CST) offset
  const CST_OFFSET = -6;

  // Add the offset to convert to UTC
  const utcDate = new Date(cstDate.getTime() - (CST_OFFSET * 60 * 60 * 1000));

  // Format the UTC date and time
  const utcDateStr = utcDate.toISOString().split('T')[0];
  const utcTimeStr = utcDate.toTimeString().split(' ')[0];

  return {
    utcDate: utcDateStr,
    utcTime: utcTimeStr
  };
}

/**
 * Convert a UTC date/time from database to CST for display
 * @param {string} utcDateStr - UTC date string
 * @param {string} utcTimeStr - UTC time string (optional)
 * @returns {object} { cstDate: 'YYYY-MM-DD', cstTime: 'HH:MM:SS' }
 */
function utcToCST(utcDateStr, utcTimeStr = '00:00:00') {
  // Create UTC date object
  const utcDateTime = new Date(`${utcDateStr}T${utcTimeStr}Z`);

  // Get CST offset
  const CST_OFFSET = -6;

  // Convert to CST
  const cstDate = new Date(utcDateTime.getTime() + (CST_OFFSET * 60 * 60 * 1000));

  // Format the CST date and time
  const cstDateStr = cstDate.toISOString().split('T')[0];
  const cstTimeStr = cstDate.toTimeString().split(' ')[0];

  return {
    cstDate: cstDateStr,
    cstTime: cstTimeStr
  };
}

/**
 * Get current date and time in CST
 * @returns {object} { date: 'YYYY-MM-DD', time: 'HH:MM:SS', datetime: Date object }
 */
function getCurrentCST() {
  const now = new Date();
  const CST_OFFSET = -6;

  // Convert current UTC time to CST
  const cstDate = new Date(now.getTime() + (CST_OFFSET * 60 * 60 * 1000));

  const dateStr = cstDate.toISOString().split('T')[0];
  const timeStr = cstDate.toTimeString().split(' ')[0];

  return {
    date: dateStr,
    time: timeStr,
    datetime: cstDate
  };
}

/**
 * Check if a CST date/time is in the past
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {boolean} true if the date/time is in the past
 */
function isInPastCST(dateStr, timeStr) {
  const currentCST = getCurrentCST();
  const appointmentDateTime = new Date(`${dateStr}T${timeStr}:00`);
  const currentDateTime = new Date(`${currentCST.date}T${currentCST.time}`);

  return appointmentDateTime < currentDateTime;
}

module.exports = {
  cstToUTC,
  utcToCST,
  getCurrentCST,
  isInPastCST
};
