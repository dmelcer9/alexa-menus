import {db} from "./handler";

function getFavoritesPath(userId) {
  return "users/" + procesString(userId) + "/favorites";
}

function procesString(str) {
    return str.toLowerCase().split(" ").join("").split(".").join("");
  }

export function getFavoritesFromDB(userId) {

    const ref = db.ref(getFavoritesPath(userId)).orderByValue();

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

      });
    });
  }

export function addFavoriteToDB(userId, favorite) {

    const ref = db.ref(getFavoritesPath(userId));

    return new Promise((accept, reject) => {
        ref.push({
          realName: favorite,
          shortName: procesString(favorite),
        }, (error) => {

          if (error) {
            reject(error);
          } else {
            accept();
          }
        });
    });
  }

export function removeFavoriteFromDB(userId, favorite) {

    const ref = db.ref(getFavoritesPath(userId));
    return new Promise((accept, reject) => {
      ref.orderByChild("shortName").equalTo(procesString(favorite)).once("value", (snapshot) => {
        snapshot.forEach((node) => {
          node.ref.remove();
          return false;
        });

        accept();

      }, () => {

        reject(); });
    });

  }

export async function removeAllFromDB(userId) {

    const ref = db.ref(getFavoritesPath(userId));
    return await ref.remove();
  }
