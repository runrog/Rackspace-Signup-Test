# abort on errors
set -e

# lint all js
npm run lint:js

# lint all scss
npm run lint:sass

# run tests
npm run test