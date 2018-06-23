import * as admin from "firebase-admin";

import serviceAccount = require("./firebase-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://alexa-dining.firebaseio.com",
});

function procesString(str) {
    return str.toLowerCase().split(" ").join("").split(".").join("");
  }

export function getFavoritesFromDB(userId) {

    const db = admin.database();

    const ref = db.ref(procesString(userId)).orderByValue();

    return new Promise((accept, reject) => {
      ref.once("value", function(value) {
        const favorites = [];
        value.forEach((node) => {
          favorites.push(node.val());
          return false;
        });
        db.goOffline();
        accept(favorites);
      }, (error) => {
        reject(error);
        db.goOffline();
      });
    });
  }

export function addFavoriteToDB(userId, favorite) {
    const db = admin.database();
    const ref = db.ref(procesString(userId));

    return new Promise((accept, reject) => {
        ref.push({
          realName: favorite,
          shortName: procesString(favorite),
        }, (error) => {
          db.goOffline();
          if (error) {
            reject(error);
          } else {
            accept();
          }
        });
    });
  }

export function removeFavoriteFromDB(userId, favorite) {
    const db = admin.database();
    const ref = db.ref(procesString(userId));
    return new Promise((accept, reject) => {
      ref.orderByChild("shortName").equalTo(procesString(favorite)).once("value", (snapshot) => {
        snapshot.forEach((node) => {
          node.ref.remove();
          return false;
        });
        db.goOffline();
        accept();

      }, () => {
        db.goOffline();
        reject(); });
    });

  }

export async function removeAllFromDB(userId) {
    const db = admin.database();
    const ref = db.ref(procesString(userId));
    return await ref.remove();
  }
