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
    //try {
        // Get the request body
        const body = JSON.parse(event.body);

        // Get the NWTB UUID from the request body
        var { nwtbUUID } = body;

        console.log("GET REQUESTING USER ACCOUNT");
        // Get the account from Firestore (accountDetail)
        const accountDetail = await db
            .collection("accountDetail")
            .where("accountNumber", "==", nwtbUUID)
            .get();
        // Print the account data
        console.log(accountDetail.docs[0].data());
        
        // Iterate through the athenaeum IDs in the accountDetail to get the athenaeum titles for the user
        console.log("GETTING ATHENAEUM LINKS");
        let athenaeumData = [];
        for (let i = 0; i < accountDetail.docs[0].data().athenaea.length; i++) {
            const athenaeum = await db
            .collection("athenaeum_roster")
            .where("atID", "==", accountDetail.docs[0].data().athenaea[i])
            .get();

            athenaeumData.push({
                atID: athenaeum.docs[0].data().atID,
                title: athenaeum.docs[0].data().title,
                type: athenaeum.docs[0].data().type,
                iconLink: athenaeum.docs[0].data().iconLink,
            });
        }

        // Return the information
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                accountDetail: accountDetail.docs[0].data(), 
                elements: {
                    athenaeumLinks: athenaeumData,
                },
            }),
        };

    /*} catch (error) {
        return {
            statusCode: 500,
            statusText: "ERROR ADM001: There was an error processing your request.",
            body: JSON.stringify({ error: "ERROR ADM001: There was an error processing your request." }),
        };
    }*/
}
