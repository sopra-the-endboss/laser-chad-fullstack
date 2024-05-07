export const GetOrder = async (userId, baseUrl) => {
  try {
    const settings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const res = await fetch(`${baseUrl}/order/${userId}`, settings);
    const data = await res.json();

    if (res.ok) {
      console.log(`DEBUG getOrder : res.ok`);
      console.log(`Order Data: ${JSON.stringify(data)}`);
      return data.products;
    } else {
      console.log(`DEBUG getOrder : res.statusCode ${res.status}`);
      console.log(`DEBUG getOrder : This is the data: ${JSON.stringify(data)}`);
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
};
