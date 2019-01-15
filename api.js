var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db.js');
var bot = require('./bot.js');

module.exports.start = function() {
  var app = express();

  app.use(bodyParser.json());

  app.get('/gay', (req, res) => res.json(db.gays));

  app.post('/gay', (req, res) => {
    db.gays = Object.assign(db.gays, req.body);
    console.log(req.body);
    res.json(req.body);
  });

  app.get('/save', (req, res) => {
    db.save();
    res.sendStatus(200);
  });

  app.post('/message', (req, res) => {
    if (typeof req.body.to === 'undefined' || typeof req.body.message === 'undefined') {
      res.sendStatus(400);
    }
    else {
      bot.send(req.body.message, req.body.to);
      res.json(req.body);
    }
  });

  app.post('/presence', (req, res) => {
    if (typeof req.body.presence === 'undefined') {
      res.sendStatus(400);
    }
    else {
      bot.setPresence(req.body.presence);
      res.json(req.body);
    }
  })

  app.listen(2000, () => console.log('Listening on port 2000'));
}