const firebase = require("firebase-admin");

const serviceAccount = require("../gfb/firebase.json");

let app;
try {
  app = firebase.app();
} catch (error) {
  app = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
  });
}

const db = app.firestore();

exports.handler = async (event) => {
  try {
    // Get the request body
    const body = JSON.parse(event.body);

    // Get the nwtbUUID, access, title, type, and iconLink from the request body
    var { nwtbUUID, access, title, type, iconLink } = body;

    // Generate random 32-character string (A-Z, a-z, 0-9)
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var newAthenaeumID = "";
    for (var i = 0; i < 32; i++) {
      newAthenaeumID += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Add the athenaeum to Firestore (athenaeum_roster)
    await db.collection("athenaeum_roster").add({
      access: access,
      atID: newAthenaeumID,
      recordIDs: [],
      title: title,
      user: nwtbUUID,
      type: type,
      iconLink: iconLink,
    });

    // Get the user's account detail
    const accountDetail = await db
      .collection('accountDetail')
      .where('accountNumber', '==', nwtbUUID)
      .get();

    // Get the user's athenaea (array) from the account detail
    var userAthenaea = accountDetail.docs[0].data().athenaea;

    // Add the new athenaeum ID to the user's athenaea array
    userAthenaea.push(newAthenaeumID);

    // Update the user's athenaea array in Firestore
    await db.collection("accountDetail").doc(accountDetail.docs[0].id).update({
      athenaea: userAthenaea,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ atID: newAthenaeumID }),
    };

   
  } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "ERROR AT003: An error occurred while saving the record." }),
      };
  }
};
