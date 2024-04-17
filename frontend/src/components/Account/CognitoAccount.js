import poolData from "../../config/UserPool";

const userPool = poolData;

const CognitoAccount = async () => {
  try {
    const currentUser = userPool.getCurrentUser();

    if (!currentUser) {
      throw new Error("No current user");
    }

    return new Promise((resolve, reject) => {
      currentUser.getSession((err, session) => {
        if (err) {
          reject(new Error("Failed to retrieve session: " + err.message));
        } else {
          handleAttributes(currentUser, session, resolve, reject);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching user session:", error);
  }
};
async function handleAttributes(user, session, resolve, reject) {
  try {
    const attributes = await new Promise((resolve, reject) => {
      user.getUserAttributes((err, attributes) => {
        if (err) {
          reject(
            new Error("Failed to retrieve user attributes: " + err.message)
          );
        } else {
          const results = {};

          for (let attribute of attributes) {
            const { Name, Value } = attribute;
            results[Name] = Value;
          }

          resolve(results);
        }
      });
    });

    resolve({
      user: user,
      session: {
        idToken: session.getIdToken().getJwtToken(),
        accessToken: session.getAccessToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken(),
      },
      attributes,
    });
  } catch (error) {
    reject(error);
  }
}

export default CognitoAccount;
