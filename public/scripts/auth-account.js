// main.js

// Import Auth0 functions
import { initAuth0, login, handleCallback, getUser, isAuthenticated, checkSession, logout } from './auth-module.js';

// Logout button
/*document.getElementById('logoutButton').addEventListener('click', () => {
  logout();
});*/

var userID = null;

const loading = document.getElementById('loading');
const page = document.getElementById('page');

(async () => {
    try {
        await initAuth0();

        // Check if the user is authenticated
        const authenticated = await isAuthenticated();

        if (authenticated && !window.location.pathname.includes("logout")) {
            console.log("IS AUTHENTICATED");
            // Get the user ID
            userID = await getUser();
            await getAccount();
        }
        else if (location.search.includes("state=") && (location.search.includes("code=") || location.search.includes("error="))) {
            console.log("HANDLE CALLBACK");
            // Set the user ID (handleCallback returns "user.sub" as the second value)
            userID = await handleCallback();
            // Remove the query string from the URL
            window.history.replaceState({}, document.title, "/");
            // Load content
            await loadAccount();
            await getAccount();
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
        // If redirectToMessage is true, redirect to the message page
        if (responseBody.redirect) {
            window.location.href = "/update/";
        }
        // Store the NWTB UUID in localStorage
        localStorage.setItem("nwtbUUID", responseBody.nwtbUUID);
    }
}

async function getAccount() {
    const nwtbUUID = localStorage.getItem("nwtbUUID");
    // Get DOM elements
    const userFullName = document.getElementById('userFullName');
    const acAthenaeumNav = document.getElementById('acAthenaeumNav');
    const acBookmarkNav = document.getElementById('acGeneralNav');
    const acBmAdd = document.getElementById('acBmAdd');

    // Get the account
    const response = await fetch("/.netlify/functions/account-getaccount", {
        method: 'POST',
        body: JSON.stringify({
            nwtbUUID: nwtbUUID,
        })
    });
    // If response is ok, parse the response
    if (response.ok) {
        // Parse the response
        const data = await response.json();
        console.log("DATA", data);
        const account = data.accountDetail;
        const elements = data.elements;
        const wifiKey = data.wifiPassword;
        // Set the user's full name
        userFullName.textContent = account.accountHolderName[0];
        
        // For each account.athenaeumLinks, create a button link
        if (elements.athenaeumLinks) {
            // For each athenaeumLink that has a type of 'default', create a button link
            elements.athenaeumLinks.forEach(link => {
                if (link.type === 'default') {
                    const buttonLink = document.createElement('span');
                    // Add buttonLink and iconLink classes
                    buttonLink.classList.add('buttonLink');
                    buttonLink.innerHTML = `<a href="/athenaeum/${link.atID}">${link.title}</a>`;
                    acAthenaeumNav.appendChild(buttonLink);
                }
            });
            // For each athenaeumLink that has a type of 'bookmark', create a button link
            elements.athenaeumLinks.forEach(link => {
                if (link.type === 'bookmark') {
                    const buttonLink = document.createElement('span');
                    buttonLink.classList.add('buttonLink', 'iconLink');
                    // Set the onclick attribute to the link.atID
                    buttonLink.setAttribute('onclick', `location.href='/bookmark/${link.atID}'`);
                    buttonLink.innerHTML = `<img src="${link.iconLink}" height="60">`;
                    // Prepend to the beginning of the list
                    acBookmarkNav.insertBefore(buttonLink, acBookmarkNav.firstChild);
                }
            });
        }
        // If account class is not 'SYSOP', hide the "New Group" button
        if (account.accountClass !== 'SYSOP') {
            acBmAdd.style.display = 'none';
        }
        loading.style.display = 'none';
        page.style.display = 'flex';
    }
}
