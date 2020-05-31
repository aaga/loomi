
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const async = require('async');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// Get home status given a userID
exports.getHomeStatus = functions.https.onRequest((req, res) => {
  const params = req.url.split("/");
  const userID = params[1];
  var ref = admin.database().ref('users/' + userID);
  ref.once('value', (snapshot) => {
    res.send(JSON.stringify(snapshot.child('isHome').val()));
  }).catch(error => {
    console.error(error);
    res.status(500).send(error);
  });
});

// Get user's partner given their userID
exports.getPartner = functions.https.onRequest((req, res) => {
  const params = req.url.split("/");
  const userID = params[1];
  var ref = admin.database().ref('users/' + userID);
  ref.once('value', (snapshot) => {
    res.send(JSON.stringify(snapshot.child('partner').val()));
  }).catch(error => {
    console.error(error);
    res.status(500).send(error);
  });
});

// Get whether or not a device should be on
exports.shouldLightBeOnForDevice = functions.https.onRequest((req, res) => {
  const params = req.url.split("/");
  const deviceID = params[1];
  const db = admin.database();
  var devicesRef = db.ref('devices/' + deviceID);
  devicesRef.once('value').then((snapshot) => {
    var users = snapshot.child('users').val();
    var returnStatus = true;
    console.log("user[0]: " + users[0]);
    console.log("user[1]: " + users[1]);
    return async.each(users, (userID, done_user) => {
      console.log("userID: " + userID);
      const ref = db.ref('users/' + userID);
      ref.once('value').then((snapshot) => {
        if (snapshot.child('isHome').val() === 'false') returnStatus = false;
        console.log("isHome: " + snapshot.child('isHome').val());
        done_user();
        return;
      }).catch(error => {
        throw(error);
      });
    }, (err) => {
      if (err) throw (err);
      res.status(200).send(JSON.stringify(returnStatus));
    });
  }).catch(error => {
    console.error(error);
    res.status(500).send(error);
  });
});

// Update user's home status when they get home or leave home (handled on client side)
exports.updateHomeStatus = functions.https.onRequest((req, res) => {
  const params = req.url.split("/");
  const userID = params[1];
  const isHome = params[2];
  admin.database().ref('users/' + userID).update({
    isHome: isHome,
  });
  res.send('success, ' + isHome);
});
