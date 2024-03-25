const initialState = '';

function apigBaseUrlReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_APIG_BASE_URL':
      return action.payload;
    default:
      return state;
  }
}

export default apigBaseUrlReducer;