exports.handler = async (event) => {
  console.log("Hello, world!");
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello, world!",
      input: event,
    }),
  };
};
