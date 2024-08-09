Create the project:

```sh
npm init # create package.json based on your answers to a few prompted questions
npm i three # add three.js to dependent list in package.json, create package-lock.json
npm i --save-dev vite # add vite to devDependent list in package.json, update package-lock.json
echo "node_modules" > .gitignore
```

Then add [index.html](index.html), [main.js](main.js), and commit and push all to github.

Run the project:

```sh
npx vite # run vite to serve the webpage, install vite if this is the first time
```