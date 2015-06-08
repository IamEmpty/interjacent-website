interjacent front-end framework
==========================

## If you have no Node.js, Bower or Gulp
If you have installed Node.js, Bower and Gulp go to step 2
If haven't install it

    npm install -g gulp
    npm install -g bower

## Step 2

    npm config set prefix ~/npm
    export PATH="$PATH:$HOME/npm/bin"

## Step 2

    cd interjacent-website
    npm install
    bower install
    gulp dist

## Notes
All styles use with normalize.css

## Run Express

    DEBUG=myapp npm start

## File structure

    app
    blocks
    includes
    layouts
    pages
    stylesheets
