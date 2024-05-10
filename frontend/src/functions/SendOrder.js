import { enqueueSnackbar } from "notistack";

export const SendOrder = async (userId, baseUrl) => {
  // send Cart to be in sync with backend
  console.log("SendOrder : sending order to backend...");
  console.log("User: ", userId);
  console.log("URL: ", baseUrl);
  try {
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    const res = await fetch(baseUrl + `/order/${userId}`, settings);
    const data = await res.json();

    if (res.ok || res.status === 409) {
      console.log(`DEBUG postCart : res.ok or duplicated, also fine`);
      enqueueSnackbar({
        message: `Your order is confirmed!`,
        variant: "success",
        style: { width: "900px" },
        anchorOrigin: { vertical: "top", horizontal: "center" },
        autoHideDuration: 3000,
      });
      return data;
    } else {
      console.log(
        `ERROR Post cart for userId ${userId}, returned ${res.status}`
      );
      console.log(`ERROR Post cart with data ${data}`);
    }
  } catch (error) {
    enqueueSnackbar({
      message: `ERROR postCart : POST could not be completed.
    In case this user does not yet have a cart in the backend,
    the current cart will not be synched to the backend.
    `,
      variant: "error",
      style: { width: "900px" },
      anchorOrigin: { vertical: "top", horizontal: "center" },
      autoHideDuration: 3000, // show for 3 seconds
    });
    console.log("ERROR postCart : POST could not be completed");
    console.error(error);
  }
};
