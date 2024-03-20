const initialState = {
  isAuthenticated: false,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER_LOGGED_IN":
      return {
        ...state,
        isAuthenticated: true,
      };
    case "SET_USER_LOGGED_OUT":
      return {
        ...state,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

export default authReducer;
