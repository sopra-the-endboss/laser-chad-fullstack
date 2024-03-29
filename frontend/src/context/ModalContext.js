import React from 'react';

// Create a context with a default empty function for handleClose
const ModalContext = React.createContext({ handleClose: () => {} });

export default ModalContext;
