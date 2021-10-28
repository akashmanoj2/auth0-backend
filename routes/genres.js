const express = require('express');
const router = express.Router();
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require('firebase-admin/auth');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const axios = require('axios');

const auth0JwksUri = "https://dev-qro6os72.us.auth0.com/.well-known/jwks.json";
const auth0Audience = "https://dev-qro6os72.us.auth0.com/api/v2/";
const auth0Issuer = "https://dev-qro6os72.us.auth0.com/";

// const awsJwksUri = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LDr2tD35o/.well-known/jwks.json";
// const awsAudience = "745ofo7at3vfvf9r96d097aeus";
// const awsIssuer = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LDr2tD35o";

initializeApp({
    credential: applicationDefault(),
});

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("Please set GOOGLE_APPLICATION_CREDENTIALS env variable to the location of service-account.json file for firebase auth to work...");
}
console.log('env: ',);

const genres = [{ id: 1, type: 'Thriller' }, { id: 2, type: 'Horror' }, { id: 3, type: 'Sci-Fi' }];

// Create middleware for checking the JWT
const checkJwt = () => {
    return jwt({
        // Dynamically provide a signing key based on the key id in the header and the signing keys provided by the JWKS endpoint
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: auth0JwksUri
        }),
        // Validate the audience and the issuer
        audience: auth0Audience, //replace with auth0 API's audience, available at Dashboard > APIs
        issuer: auth0Issuer, //replace with auth0 API's issue
        algorithms: ['RS256']
    });
}

//Create middleware to check firebase token
const checkFirebaseIdentityToken = (req, res, next) => {
    const idToken = req.headers.authorization;
    if (idToken) {
        const token = idToken.split(' ')[1];
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

//Create middleware to check aws token
const checkAwsIdentityToken = async (req, res, next) => {
    const idToken = req.headers.authorization;
    if (idToken) {
        const COGNITO_URL = `https://cognito-idp.us-east-1.amazonaws.com/`;
        const token = idToken.split(' ')[1];
        try {
            const { data } = await axios.post(
                COGNITO_URL,
                {
                    AccessToken: token
                },
                {
                    headers: {
                        "Content-Type": "application/x-amz-json-1.1",
                        "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser"
                    }
                }
            )

            req.user = data;
            next();
        } catch (error) {
            return res.status(401).json({
                message: 'Inavalid token !'
            });
        }
    } else {
        res.status(400).send("Identity token missing");
    }
};

router.get('/firebase', checkFirebaseIdentityToken, (req, res) => {
    res.send(genres);
});

router.get('/aws', checkAwsIdentityToken, (req, res) => {
    res.send(genres);
});

router.get('/', checkJwt, (req, res) => {
    res.send(genres);
});


module.exports = router;