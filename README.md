## Create the project

```sh
docker compose run --rm --service-ports sh
# create package.json based on your answers to a few prompted questions
npm init
# install three to node_modules,
# add it to dependent list in package.json,
# create package-lock.json
npm i three
# install vite to node_modules,
# add it to devDependent list in package.json (option -D),
# update package-lock.json
npm i -D vite
# no need to save installed modules
# according to https://docs.npmjs.com/cli/v8/commands/npm-install,
# if NODE_ENV is not set to production, both three and vite will be installed in node_modules
# otherwise, only three will be installed there
echo "node_modules" > .gitignore
```

Then add [index.html](index.html), [js/main.js](js/main.js), and commit and push all to github.

## Run the project

```sh
docker compose run --rm --service-ports sh
# run vite to serve the webpage
# --host: set ip address to `0.0.0.0`, which lets the server listen on all network interfaces
npx vite --host
# or the following (the dev script is defined in package.json)
npm run dev
```
