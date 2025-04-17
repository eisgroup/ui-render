This is a monorepo project, bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and custom [Gulp](https://gulpjs.com/) scripts.
It uses:

* [React.js](https://reactjs.org/)
* [Semantic UI](https://react.semantic-ui.com/)
* [LESS](http://lesscss.org/)

Check the [/docs](./docs) folder to get a basic understanding of the project's [architecture](./docs/Architecture.md) and [coding standards](./docs/standards.md) before continuing.

## Development Installation

1. Install [Node.js](https://nodejs.org/), if you haven't already (version 10.15.3).
2. Install [Yarn package manager](https://yarnpkg.com/en/), if you haven't already.
3. Install [LiveReload Chrome extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei), for hot-reloading of CSS style changes.
4. Install [Webstorm](https://www.jetbrains.com/webstorm/) IDE, then configure [code style](docs/code-style.png), install `Save Action` plugin and configure it like this [screenshot](docs/save-action.png);
5. Create `.npmrc` configuration file based on `.npmrc.example`
6. Navigate to project root folder and install dependencies by running this command in terminal:

### `yarn`

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in Chrome browser, then activate LiveReload extension.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner (or `yarn test --watch -o` to run in interactive watch mode).<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn e2e`

Launches end-to-end integration tests using Cypress.

### `yarn deploy`

Build the app under `web` workspace and push it to GitHub pages [documentation](https://eisgroup.github.io/ui-render/).

### `yarn workspace web build`

Builds the app for production to the `/repos/web/build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn workspace web eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


# Installation on Windows
1. Enable pasting into command prompt with CTRL + V
    - Install <https://www.autohotkey.com/>.
    - Download and execute <http://www.howtogeek.com/wp-content/uploads/gg/up/PasteCommandPrompt.ahk>.

2. Install Git <https://git-scm.com/downloads>.

3. Enable Git password caching by installing <https://gitcredentialstore._plex.com/>.

4. Setup up git global configs at C:\Users\username (OPTIONAL)
- Option 1: Add this to .gitconfig file (usually located at C:\Users\username)
```
# This is Git's per-user configuration file.
[user]
    name = Full Name
    email = example@gmail.com
[alias]
    st = status
    ci = commit -m
    amend = commit --amend
    co = checkout
    cp = cherry-pick
    br = branch -avv
    up = rebase
    unstage = reset HEAD --
    last = log -1 HEAD
    lg = log --graph --pretty=format:'%C(auto)%h -%d %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
[push]
    default = simple
```
- Option 2: Using command line
```
# Tell Git who you are
git config --global user.name "Full Name"
git config --global user.email example@gmail.com
# Add some SVN-like aliases
git config --global alias.st "status"
git config --global alias.ci "commit -m"
git config --global alias.amend "commit --amend"
git config --global alias.co "checkout"
git config --global alias.cp "cherry-pick"
git config --global alias.br "branch -avv"
git config --global alias.up "rebase"
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"
git config --global alias.lg "log --graph --pretty=format:'%C(auto)%h -%d %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
git config --global push.default "simple"
```
