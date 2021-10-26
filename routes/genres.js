const express = require('express');
const router = express.Router();
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require('firebase-admin/auth');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

initializeApp({
    credential: applicationDefault(),
});

console.log('env: ', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const genres = [{ id: 1, type: 'Thriller' }, { id: 2, type: 'Horror' }, { id: 3, type: 'Sci-Fi' }];

// Create middleware for checking the JWT
const checkJwt = jwt({
    // Dynamically provide a signing key based on the key id in the header and the signing keys provided by the JWKS endpoint
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://dev-qro6os72.us.auth0.com/.well-known/jwks.json`
    }),
    // Validate the audience and the issuer
    audience: 'https://dev-qro6os72.us.auth0.com/api/v2/', //replace with auth0 API's audience, available at Dashboard > APIs
    issuer: 'https://dev-qro6os72.us.auth0.com/', //replace with auth0 API's issue
    algorithms: ['RS256']
});

//Create middleware to check firebase token
const checkFirebaseIdentityToken = (req, res, next) => {
    const idToken = req.headers.authorization;
    if (idToken) {
        const token = idToken.split('Bearer ')[1]
        getAuth()
            .verifyIdToken(token)
            .then((decodedToken) => {
                next();
            })
            .catch((error) => {
                console.log("Error occured while verifying token.", error);
                res.status(401).send("Invalid token!");
            });
    } else {
        res.status(400).send("Identity token missing");
    }
}

router.get('/firebase', checkFirebaseIdentityToken, (req, res) => {
    res.send(genres);
});

router.get('/', checkJwt, (req, res) => {
    res.send(genres);
});


module.exports = router;