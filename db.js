var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, (err, client) => {
  if (err) {
    console.log(err);
    console.log("Could not connect to db. Shutting down.");
    process.exit();
  }
  else {
    var db = client.db('db');
    module.exports.users = db.collection('users');
    module.exports.rigs = db.collection('rigs');
    module.exports.trades = db.collection('trades');
    console.log("Connected to db");
  }
});