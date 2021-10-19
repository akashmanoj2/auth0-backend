const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');

const genres = require('./routes/genres');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
    algorithms: [ 'RS256' ]
  });

//allow access to api's only if request has valid signature
app.use('/api/genres', checkJwt, genres);

const port = '3000';
app.listen(port, () => {
    console.log(`Listenting on port ${port} ...`)
});
