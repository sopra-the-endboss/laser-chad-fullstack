# Choice of React for Frontend Development

<b>Familiarity</b>: Our team is proficient with React, which streamlines the development process and reduces the learning curve. This existing expertise allows us to leverage React's full capabilities efficiently.

<b>Wide Support and Community</b>: React is maintained by Facebook and has a vast and active community. This extensive support network provides a wealth of libraries, tools, and frameworks that enhance development speed and solve common and complex challenges effectively.

<b>Modular Structure</b>: In our project, React's component-based architecture plays a critical role. We structure our application into distinct elements such as components, views, hooks, utility functions, and guards. This organization:

- Components: Reusable and isolated UI parts that manage their state and design.
- Views: Compositions of components that form entire pages or significant sections of a page.
- Hooks: Custom hooks are used to abstract component logic and share behaviors in a functional way, which keeps the component code clean and focused on rendering.
- Utility Functions: Helpers and utilities to manage common tasks across components without duplicating code.
- Guards: Components or hooks that control access to certain parts of the application, ensuring that business and authorization rules are adhered to.
This structured approach not only ensures a clear separation of concerns but also enhances maintainability and scalability. React's declarative nature simplifies the creation of interactive UIs, and its efficient update mechanism (via the virtual DOM) ensures high performance across both desktop and mobile platforms. The combination of these factors made React the optimal choice for our frontend development.

# Choice of authentication
For authentication, we chose the prebuilt AWS Cognito and Amplify services, driven by the project's tight timeline and their suitability for our needs. Authentication is a vital component, especially for projects with user-specific features like e-commerce platforms. Given that LocalStack was a project requirement, Cognito proved to be an excellent match, significantly reducing our initial development time and allowing us to make rapid progress from the start.

The whole documentation can be found in the docs folder in `frontend/docs/index.html`. 

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


### Setup Amplify in your environment

- Download amplify cli and set up your local env with it (TBD: Docker): 
  - Windows `curl -sL https://aws-amplify.github.io/amplify-cli/install-win -o install.cmd && install.cmd`
  - Mac / Linux `curl -sL https://aws-amplify.github.io/amplify-cli/install | bash && $SHELL`
- Fetch the image from our aws organization: `amplify pull --appId d47a6guqh1kks --envName staging`
- npm install
- should work now. 

### run it from docker
- `docker build -t chad .`
- `docker run -p 3000:3000 chad`
- `docker stop chad`


