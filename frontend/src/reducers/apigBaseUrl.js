/**
 * Redux reducer for managing the API Gateway base URL.
 * This reducer updates the state with a new base URL when the corresponding action is dispatched.
 * The state is a simple string representing the base URL of the API Gateway.
 *
 * @param {string} state - The current state of the API Gateway base URL.
 * @param {Object} action - The action dispatched to update the state.
 * @return {string} The new state after applying the action.
 */

const initialState = "";

function apigBaseUrlReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_APIG_BASE_URL":
      /**
       * Handles setting the API Gateway base URL.
       * The payload should contain the new base URL as a string.
       */
      return action.payload;
    default:
      // Returns the current state if no actions match.
      return state;
  }
}

export default apigBaseUrlReducer;
