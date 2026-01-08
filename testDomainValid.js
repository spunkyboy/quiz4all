const isDomainValidation = require('./middleware/domainValidate');

async function testDomains() {
    const testEmails = [
        'user@gmail.com',           // valid domain
        'test@yahoo.com',           // valid domain
        'hello@nonexistentxyz.com', // invalid domain
        'fake@abc1234random.com',   // invalid domain
        'temp@mailinator.com'       // disposable domain (if you added filter)
    ];

    for (const email of testEmails) {
        const result = await isDomainValidation(email);
        console.log(`${email} => ${result ? 'VALID' : 'INVALID'}`);
    }
}

testDomains();
