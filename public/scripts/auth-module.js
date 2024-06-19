// authModule.js

let auth0Client = null;

export const initAuth0 = async () => {
  try {
    auth0Client = await auth0.createAuth0Client({
        domain: "YOUR_AUTH0_DOMAIN",
        clientId: "YOUR_AUTH0_CLIENT_ID",
        authorizationParams: {
            redirect_uri: window.location.origin + "/",
        },
        useRefreshTokens: true,
        cacheLocation: "localstorage",
    });

    return auth0Client;
  } catch (error) {
        console.error("Error initializing Auth0:", error);
        throw error;
  }
};

export const login = async () => {
    //await initAuth0();
    auth0Client.loginWithRedirect();
};

export const handleCallback = async () => {
    //await initAuth0();
    try {
        await auth0Client.handleRedirectCallback();
        const user = await auth0Client.getUser();
        // Return the user ID
        return user.sub;
    } catch (error) {
        console.error("Error handling callback:", error);
        throw error;
    }
};

export const getUser = async () => {
    //await initAuth0();
    const user =  await auth0Client.getUser();
    // Log the user object (DEBUG)
    console.log(user);
    return user.sub;
}

export const isAuthenticated = async () => {
    //await initAuth0();
    return await auth0Client.isAuthenticated();
};

export const checkSession = async () => {
    //await initAuth0();
    return await auth0Client.checkSession();
};

export const logout = async () => {
    //await initAuth0();
    auth0Client.logout({
        returnTo: window.location.origin,
    });
};
