// validateDomain.js
const domValid = require('dns');

/**
 * Checks if the email domain has valid MX records
 * @param {string} email
 * @returns {Promise<boolean>}
 */
function isDomainValidation(email) {
    return new Promise((resolve) => {
        const domain = email.split('@')[1];
        if (!domain) return resolve(false); // no domain found

        domValid.resolveMx(domain, (err, addresses) => {
            if (err || addresses.length === 0) {
                resolve(false); // domain cannot receive emails
            } else {
                resolve(true); // domain is valid
            }
        });
    });
}

// Export the function
module.exports = isDomainValidation;
