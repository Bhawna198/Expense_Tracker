/**
 * Format a date object or string to YYYY-MM-DD format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Get the current month and year
 * @returns {Object} Object with month and year properties
 */
export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
    year: now.getFullYear()
  };
};

/**
 * Get the first and last day of a month
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @returns {Object} Object with firstDay and lastDay properties
 */
export const getMonthDateRange = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  return {
    firstDay: formatDate(firstDay),
    lastDay: formatDate(lastDay)
  };
};

/**
 * Generate an array of the last n months
 * @param {number} count - Number of months to generate
 * @returns {Array} Array of objects with month and year properties
 */
export const getLastMonths = (count = 6) => {
  const months = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: month.getMonth() + 1,
      year: month.getFullYear(),
      label: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    });
  }
  
  return months;
};

/**
 * Generate random colors for chart
 * @param {number} count - Number of colors to generate
 * @returns {Array} Array of color strings
 */
export const generateChartColors = (count) => {
  const colors = [];
  const hueStep = 360 / count;
  
  for (let i = 0; i < count; i++) {
    const hue = i * hueStep;
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  
  return colors;
};

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Get common expense categories
 * @returns {Array} Array of category strings
 */
export const getExpenseCategories = () => [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Gifts & Donations',
  'Other'
];