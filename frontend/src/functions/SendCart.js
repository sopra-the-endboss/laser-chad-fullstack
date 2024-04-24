const postCart = async (userId, baseUrl) => {
  // Send POST to create a cart if not exists
  try {
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    const res = await fetch(baseUrl + `/cart/${userId}`, settings);
    const data = await res.json();

    if (res.ok || res.status === 409) {
      console.log(`DEBUG postCart : res.ok or duplicated, also fine`);
    } else {
      console.log(
        `ERROR Post cart for userId ${userId}, returned ${res.status}`
      );
      console.log(`ERROR Post cart with data ${data}`);
    }
  } catch (error) {
    console.error(error);
  }
};

const putCartBatch = async (userId, putBody, baseUrl) => {
  // Send PUT BATCH to place the whole cart as is
  console.log("DEBUG putCartBatch : This is the body", putBody);

  try {
    const settings = {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(putBody),
    };
    const res = await fetch(baseUrl + `/cart/${userId}/batch`, settings);
    const data = await res.json();

    if (res.ok) {
      console.log("DEBUG putCartBatch : res.ok");
    } else {
      console.log(
        "ERROR putCartBatch : for userId",
        userId,
        " returned ",
        res.status
      );
      console.log("ERROR putCartBatch : with data ", data);
    }
  } catch (error) {
    console.error(error);
  }
};

export const SendCart = async (userId, cartItems, baseUrl) => {
  console.log("SendCart : sending cart to backend...");
  console.log("User: ", userId);
  console.log("CartItems: ", cartItems);

  // Add the cartItems as "products" value to the body to send
  const putBatchBody = {"products" : cartItems};
  console.log("Cart Object ", putBatchBody);

  const postRes = await postCart(userId, baseUrl);
  const putCart = await putCartBatch(userId, putBatchBody, baseUrl);
};
