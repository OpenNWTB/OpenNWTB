const firebase = require("firebase-admin");

const serviceAccount = require("../gfb/firebase.json");

let app;
try {
  app = firebase.app();
} catch (error) {
  app = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
  });
}

const db = app.firestore();

exports.handler = async (event) => {
  
  // Get the request body
  const { body } = event;

  // Get the auth0UserId from the body
  const { auth0UserId } = JSON.parse(body);

  // Find the user in the database (accountDetail)
  const accountDetail = await db
      .collection('accountDetail')
      .where('auth0UserId', '==', auth0UserId)
      .get();

  // If the user is not found, return an error
  if (accountDetail.empty) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'ADM002: User not in database.' }),
    };
  }

  // Get the user's account number
  const userAccountNumber = accountDetail.docs[0].data().accountNumber;

  // Return the user's account number
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      nwtbUUID: userAccountNumber
    }),
  };

};


