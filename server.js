const express = require('express');
const fs = require("fs");
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

const host = 'localhost';
const port = 8000;
let jsonParser = bodyParser.json();

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.get('/game.html', (req, res) => {
    res.sendFile(`${__dirname}/game.html`);
});


app.post('/asset/score.json',jsonParser,function(req,res){
    fs.writeFile('./static/asset/score.json', JSON.stringify(req.body) , (err) => {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
});

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});