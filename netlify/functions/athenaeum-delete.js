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

    // Get the record ID and athenaeum ID from the request body
    var { recordID, athenaeumID } = body;

    console.log("BODY", body);
    console.log("RECORD ID", recordID);

    // Get the record from Firestore (athenaeum_data)
    const record = await db
      .collection("athenaeum_data")
      .where("recordID", "==", recordID)
      .get();

    // If the record does not exist, return an error
    if (record.docs.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "ERROR AT005: Record not found." }),
      };
    }

    // Otherwise delete the record
    await db.collection("athenaeum_data").doc(record.docs[0].id).delete();

    // Get the athenaeum from Firestore (athenaeum_roster; contains atID and an array of recordIDs)
    const athenaeum = await db
      .collection("athenaeum_roster")
      .where("atID", "==", athenaeumID)
      .get();

    // Get the recordIDs from the athenaeum
    let recordIDs = athenaeum.docs[0].data().recordIDs;

    // Remove the recordID from the athenaeum
    recordIDs = recordIDs.filter((value) => value !== recordID);

    // Update the athenaeum with the new recordIDs
    await db.collection("athenaeum_roster").doc(athenaeum.docs[0].id).update({
      recordIDs: recordIDs,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Record deleted successfully." }),
    };

  } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "ERROR AT004: An error occurred while deleting the record." }),
      };
  }
};
