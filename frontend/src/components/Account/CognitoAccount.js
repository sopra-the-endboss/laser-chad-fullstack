import Pool from "../../config/UserPool";

const CognitoAccount = async () => {
  return new Promise((resolve, reject) => {
    const user = Pool.getCurrentUser();
    if (user) {
      user.getSession(async (err, session) => {
        if (err) {
          reject(err);
        } else {
          try {
            const attributes = await new Promise((resolve, reject) => {
              user.getUserAttributes((err, attributes) => {
                if (err) {
                  reject(err);
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
              user: user.getUsername(),
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
      });
    } else {
      reject(new Error("User not found"));
    }
  });
};

export default CognitoAccount;
