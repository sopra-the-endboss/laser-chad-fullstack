export const setUserLoggedIn = (user) => ({
  type: "SET_USER_LOGGED_IN",
  payload: user,
});

export const setUserLoggedOut = () => ({
  type: "SET_USER_LOGGED_OUT",
});
