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

    // Get the NWTB UUID, and record ID from the request body
    var { recordID } = body;

    console.log("BODY", body);
    console.log("RECORD ID", recordID);

    // If the record does not exist, create a new record
    if (recordID === "" || recordID === null || recordID === undefined) {
        console.log("NEW RECORD");
        // Generate random 32-character string (A-Z, a-z, 0-9)
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var newRecordID = "";
        for (var i = 0; i < 32; i++) {
            newRecordID += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        console.log("NEW RECORD ID", newRecordID);
        console.log("ADDING");
        // Add the record to Firestore (athenaeum_data)
        await db.collection("athenaeum_data").add({
          recordCategory: body.recordCategory,
          recordID: newRecordID,
          recordLinkToData: body.recordLinkToData,
          recordTags: body.recordTags,
          recordTitle: body.recordTitle,
        });
        console.log("ADDED SUCCESSFULLY");
        // Add the recordID to the athenaeum_roster
        // Get the athenaeum from Firestore (athenaeum_roster; contains atID and an array of recordIDs)
        console.log("UPDATING ROSTER");
        const athenaeum = await db
          .collection("athenaeum_roster")
          .where("atID", "==", body.athenaeumID)
          .get();

        // Get the recordIDs from the athenaeum
        let recordIDs = athenaeum.docs[0].data().recordIDs;
        recordIDs.push(newRecordID);
        // Update the athenaeum with the new recordID
        await db.collection("athenaeum_roster").doc(athenaeum.docs[0].id).update({
            recordIDs: recordIDs,
        });
        console.log("ROSTER UPDATED");
    }

    // Otherwise find and update the existing record
    else {
      // Get the record from Firestore (athenaeum_data)
      const record = await db
        .collection("athenaeum_data")
        .where("recordID", "==", recordID)
        .get();
      console.log("RECORD", record);
      console.log('RECORD FOUND', record.docs[0].id, "RECORD ID: ", record.docs[0].data().recordID);
      console.log("RECORD UPDATING");
        await db.collection("athenaeum_data").doc(record.docs[0].id).update({
            recordTitle: body.recordTitle,
            recordCategory: body.recordCategory,
            recordTags: body.recordTags,
        });
    }
  } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "ERROR AT003: An error occurred while saving the record." }),
      };
  }
};
