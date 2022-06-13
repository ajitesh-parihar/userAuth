//Server detail, store in env
const url = "192.168.0.111";
const port = "3000";

//Create new user
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
  //Enable to login after signup for testing.
  // login(newDetails);
};

//Log into existing account
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

//Invalidate refreshkey in server and remove data from app
export const logout = async (refreshToken, setData) => {
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

//Refresh expired access token
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

//Fetch watchlist from server
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

//Update watchlist on server
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
  //Enable to fetch after set for testing.
  // getWatchlist();
};
