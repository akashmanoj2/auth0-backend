const express = require('express');
const app = express();
const cors = require('cors');

const genres = require('./routes/genres');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//allow access to api's only if request has valid signature
app.use('/api/genres', genres);

const port = '3000';
app.listen(port, () => {
    console.log(`Listenting on port ${port} ...`)
});
