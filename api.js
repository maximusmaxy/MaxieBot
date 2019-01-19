var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db.js');
var bot = require('./bot.js');

module.exports.start = function() {
  var app = express();

  app.use(bodyParser.json());

  app.get('/users', (req, res) => {
    db.users.find({}).toArray().then((users) => {
      res.json({users: users});
    }).catch((err) => {
      error(res, err);
    })
  });

  app.get('/rigs', (req, res) => {
    db.rigs.find({}).toArray().then((rigs) => {
      res.json({rigs: rigs})
    }).catch((err) => {
      error(res, err);
    })
  });

  app.post('/user', (req, res) => {
    if (typeof req.body.key === 'undefined') {
      res.sendStatus(400);
    }
    else {
      db.users.update({ key: req.body.key }, { $set: req.body }, { upsert: true }).then((result) => {
        success(res, req.body);
      }).catch((err) => {
        error(res, err);
      });
    }
  });

  app.post('/rig', (req, res) => {
    if (typeof req.body.key === 'undefined') {
      res.sendStatus(400);
    }
    else {
      db.rigs.update({ key: req.body.key }, { $set: req.body }, { upsert: true }).then((result) => {
        success(res, req.body);
      }).catch((err) => {
        error(res, err);
      });
    }
  });

  app.delete('/user', (req, res) => {
    if (typeof req.body.key === 'undefined') {
      res.sendStatus(400);
    }
    else {
      db.users.deleteOne({ key: req.body.key }).then((result) => {
        success(res, req.body);
      }).catch((err) => {
        error(res, err);
      });
    }
  });

  app.delete('/rig', (req, res) => {
    if (typeof req.body.key === 'undefined') {
      res.sendStatus(400);
    }
    else {
      db.rigs.deleteOne({ key: req.body.key }).then((result) => {
        success(res, req.body);
      }).catch((err) => {
        error(res, err);
      });
    }
  });

  app.post('/message', (req, res) => {
    if (typeof req.body.to === 'undefined' || typeof req.body.message === 'undefined') {
      res.sendStatus(400);
    }
    else {
      bot.sendTo(req.body.message, req.body.to);
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

function success(res, suc) {
  console.log(suc);
  res.sendStatus(200);
}

function error(res, err) {
  console.log(err);
  res.sendStatus(500);
}