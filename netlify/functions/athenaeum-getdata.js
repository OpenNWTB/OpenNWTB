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

    // Get the NWTB UUID, and Athenaeum ID from the request body
    var { nwtbUUID, athenaeumID } = body;

    console.log("BODY", body);
    console.log("REQUEST");

    // Get the account from Firestore (accountDetail)
    const accountDetail = await db
      .collection("accountDetail")
      .where("accountNumber", "==", nwtbUUID)
      .get();
    
    // If the athenaeumID is blank or null, find the default athenaeumID for the user (accountDetail contains defaultAthenaeumID)
    if (athenaeumID === "" || athenaeumID === null) {
      athenaeumID = accountDetail.docs[0].data().defaultAthenaeumID;
    }
    
    // Get the athenaeum from Firestore (athenaeum_roster; contains atID and an array of recordIDs), sort in alphabetical order by recordTitle
    const athenaeum = await db
      .collection("athenaeum_roster")
      .where("atID", "==", athenaeumID)
      .get();

    // If the nwtbUUID does not match the user string found in athenaeum, check if the athenaeum is public (access)
    if (athenaeum.docs[0].data().user !== nwtbUUID) {
      if (athenaeum.docs[0].data().access !== "public") {
        return {
          statusCode: 403,
          statusText: "ERROR AT002: You do not have access to this athenaeum.",
          body: JSON.stringify({ error: "ERROR AT002: You do not have access to this athenaeum." }),
        };
      }
    }

    // For each record in the athenaeum, get the record from Firestore (athenaeum_data)
    let athenaeumData = [];
    for (let i = 0; i < athenaeum.docs[0].data().recordIDs.length; i++) {
      const record = await db
        .collection("athenaeum_data")
        .where("recordID", "==", athenaeum.docs[0].data().recordIDs[i])
        .get();
      athenaeumData.push(record.docs[0].data());
      console.log(record.docs[0].data());
    }

    // Sort the athenaeum data by recordTitle
    athenaeumData.sort((a, b) => {
      if (a.recordTitle < b.recordTitle) {
        return -1;
      }
      if (a.recordTitle > b.recordTitle) {
        return 1;
      }
      return 0;
    });

    console.log(athenaeumID);

    // Return the athenaeum data
    return {
      statusCode: 200,
      body: JSON.stringify({
        athenaeumData,
        atID: athenaeumID,
        atTitle: athenaeum.docs[0].data().title,
      }),
    };

  }
  catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ERROR AT001: Unknown error getting Athenaeum data." }),
    };
  }
}




    

