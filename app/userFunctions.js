/** @constant {string}
    @default
*/
const url = "192.168.0.111";

/** @constant {string}
    @default
*/
const port = "3000";

/**
 * Callback function to set the tokens state.
 * @callback setTokens
 */
/**
 * Callback function to set the watchlist state.
 * @callback setData
 */

/**
 * Sends the data input by the
 * user to the backend to register
 * a new user.
 * @param {Object} newDetails -
 * Data to be sent to the api.
 * @param {string} newDetails.username -
 *  Username to be sent to the api
 *  for registration.
 * @param {string} newDetails.password -
 *  Password to be sent to the api
 *  for registration.
 * @returns {boolean} - Success or failure
 */
export const signUp = async (newDetails) => {
  // console.log(newDetails);
  if (
    newDetails.username == undefined ||
    newDetails.password == undefined ||
    newDetails.username == "" ||
    newDetails.password == ""
  ) {
    console.warn("Missing deets");
    // return;
  }
  try {
    const response = await fetch(`http://${url}:${port}/signup`, {
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(newDetails),
    });
    const result = await response.text();
    if (result == "Duplicate") {
      console.warn("Username already exists");
      return;
    }
    // console.log(result);
  } catch (e) {
    console.log(e);
  }
};

/**
 * Sends the data input by the
 * user to log into their account.
 * @param {Object} details -
 * Data to be sent to the api.
 * @param {string} details.username -
 *  Username to be sent to the api
 *  for logging in.
 * @param {string} details.password -
 *  Password to be sent to the api
 *  for logging in.
 * @param {setTokens} setTokens -
 *  Set tokens state to the new tokens
 *  sent by the backend.
 * @returns {boolean} - Success or failure
 */
export const login = async (details, setTokens, data, setData) => {
  if (
    details.username == undefined ||
    details.password == undefined ||
    details.username == "" ||
    details.password == ""
  ) {
    console.warn("Missing deets");
    return;
  }
  try {
    const response = await fetch(`http://${url}:${port}/login`, {
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(details),
    });
    let result = await response.text();
    if (
      result == "Forbidden" ||
      result == "Invalid" ||
      result == "Unauthorized"
    ) {
      console.warn("Invalid credentials");
      return;
    }
    result = JSON.parse(result);
    setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    setData({ ...data, username: result.username });
    // console.log(result);
  } catch (e) {
    console.log(e);
  }
};

/**
 * Sends the refresh token to
 * the backend to invalidate it.
 * @param {string} refreshToken -
 *  Refresh token of the current user.
 */
export const logout = async (refreshToken, setTokens, setData) => {
  try {
    // console.log({ refreshToken: tokens.refreshToken });
    const response = await fetch(`http://${url}:${port}/logout`, {
      method: "DELETE",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ token: refreshToken }),
    });
    const result = await response.json();
    setTokens(result);
  } catch (e) {
    console.log(e);
  }
  setData({
    username: "",
    watchlist: [],
  });
};

/**
 * Refresh access token in case
 * of expiration.
 * @param {Object} tokens -
 *  State which contains the access
 *  token and the refresh token of
 *  the current user.
 * @param {setTokens} setTokens -
 *  Set tokens state to the new tokens
 *  sent by the backend.
 * @returns {string} - New access token
 *  received from the backend.
 */
export const refreshAccessToken = async (tokens, setTokens) => {
  const refreshResponse = await fetch(`http://${url}:${port}/refreshToken`, {
    method: "POST",
    headers: new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ token: tokens.refreshToken }),
  });
  let refreshResult = await refreshResponse.text();
  // console.log(refreshResult);
  if (
    refreshResult != "Forbidden" &&
    refreshResult != "Invalid" &&
    refreshResult != "Unauthorized"
  ) {
    refreshResult = JSON.parse(refreshResult);
    setTokens({ ...tokens, accessToken: refreshResult.accessToken });
    return refreshResult.accessToken;
  } else {
    console.warn("Invalid refresh key");
  }
};

/**
 * Fetch the watchlist of the
 * current user from the database.
 * @param {Object} tokens -
 *  State which contains the access
 *  token and the refresh token of
 *  the current user.
 * @param {setTokens} setTokens -
 *  Set tokens state to the new tokens
 *  sent by the backend.
 * @param {setData} setData -
 *  Set watchlist state to the new
 *  data received from the backend.
 * @returns {boolean} - Success or failure
 */
export const getWatchlist = async (tokens, setTokens, data, setData) => {
  try {
    const response = await fetch(`http://${url}:${port}/watchlist`, {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${tokens.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
    });
    const result = await response.text();
    // console.log(result);
    if (result == "Forbidden") {
      const newAccessToken = await refreshAccessToken(tokens, setTokens);
      if (!newAccessToken) return;
      try {
        const newResponse = await fetch(`http://${url}:${port}/watchlist`, {
          method: "POST",
          headers: new Headers({
            Authorization: `Bearer ${newAccessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          }),
        });
        const newResult = await newResponse.text();
        // console.log(newResult);
        setData({ ...data, watchlist: newResult.split(",") });
      } catch (e) {
        console.log(e);
      }
    } else {
      setData({ ...data, watchlist: result.split(",") });
    }
  } catch (e) {
    console.log(e);
  }
};

/**
 * Update the watchlist stored in
 * the database.
 * @param {string} inputData -
 *  New watchlist which contains the
 *  newly added stock symbol.
 * @param {Object} tokens -
 *  State which contains the access
 *  token and the refresh token of
 *  the current user.
 * @param {setTokens} setTokens -
 *  Set tokens state to the new tokens
 *  sent by the backend.
 */
export const setWatchlist = async (inputData, tokens, setTokens) => {
  // console.log(JSON.stringify({ watchlist: inputData.watchlist }));
  try {
    const response = await fetch(`http://${url}:${port}/updateWatchlist`, {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${tokens.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ watchlist: inputData.watchlist }),
    });
    const result = await response.text();
    // console.log(result);
    if (result == "Forbidden") {
      const newAccessToken = await refreshAccessToken(tokens, setTokens);
      // console.log(newAccessToken);
      if (!newAccessToken) return;
      try {
        const newResponse = await fetch(
          `http://${url}:${port}/updateWatchlist`,
          {
            method: "POST",
            headers: new Headers({
              Authorization: `Bearer ${newAccessToken}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({ watchlist: inputData.watchlist }),
          }
        );
        const newResult = await newResponse.text();
        // console.log(newResult);
      } catch (e) {
        console.log(e);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
