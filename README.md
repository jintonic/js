Create the project:

```sh
docker compose run --rm --service-ports sh
npm init # create package.json based on your answers to a few prompted questions
npm i three # add three.js to node_modules, dependent list in package.json, create package-lock.json
npm i --save-dev vite # add vite to node_modules, devDependent list in package.json, update package-lock.json
echo "node_modules" > .gitignore
```

Then add [index.html](index.html), [main.js](main.js), and commit and push all to github.

Run the project:

```sh
docker compose run --rm --service-ports sh
npx vite --host # run vite to serve the webpage, install vite if this is the first time
```

`--host` is used to specify the ip address to `0.0.0.0`, which lets the server to listen to any connection.