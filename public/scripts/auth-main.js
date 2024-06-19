// main.js

// Import Auth0 functions
import { initAuth0, login, handleCallback, getUser, isAuthenticated, checkSession, logout } from './auth-module.js';

// Logout button
/*document.getElementById('logoutButton').addEventListener('click', () => {
  logout();
});*/

var userID = null;

(async () => {
    try {
        await initAuth0();

        // Check if the user is authenticated
        const authenticated = await isAuthenticated();

        if (authenticated && !window.location.pathname.includes("logout")) {
            console.log("IS AUTHENTICATED");
            // Get the user ID
            userID = await getUser();
            loadAccount();
        }
        else if (location.search.includes("state=") && (location.search.includes("code=") || location.search.includes("error="))) {
            console.log("HANDLE CALLBACK");
            // Set the user ID (handleCallback returns "user.sub" as the second value)
            userID = await handleCallback();
            // Load content
            loadAccount();
        }
        else if (authenticated && window.location.pathname == "/logout/") {
            // Clear specifically the nwtbUUID from localStorage
            localStorage.removeItem("nwtbUUID");
            // Trigger logout function
            logout();
        }
        else {
            console.log("TRIGGER LOGIN");
            // Trigger login function
            login();
        }
    }
    catch (error) {
        console.error("Error initializing Auth0: ", error);
    }
})();

async function loadAccount () {
    // Check if the user is authenticated
    // Fetch the account number from the serverless function (auth-matchaccount)   
    const response = await fetch("/.netlify/functions/account-match", {
        method: "POST",
        body: JSON.stringify({
            auth0UserId: userID,
        }),
    });
    // If a match is found, store the NWTB UUID in localStorage
    if (response.ok) {
        // Get the response body
        const responseBody = await response.json();
        // Store the NWTB UUID in localStorage
        localStorage.setItem("nwtbUUID", responseBody.nwtbUUID);
    }
}
