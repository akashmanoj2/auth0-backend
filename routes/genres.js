const express = require('express');
const router = express.Router();

const genres = [{ id: 1, type: 'Thriller' }, { id: 2, type: 'Horror' }, { id: 3, type: 'Sci-Fi' }];

router.get('/', (req, res) => {
    res.send(genres);
});

router.get('/:id', (req, res) => {
    const genre = genres.find(genre => genre.id === parseInt(req.params.id));
    if(!genre) {
        return res.status(404).send('Genre not found !');
    }
    
    res.send(genre);
});

module.exports = router;