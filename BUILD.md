# Build Instructions

This document provides the instructions to build the project from source.

## Prerequisites

-   Node.js (v16 or higher)
-   yarn

## Building the project

1. **Install dependencies:**

    ```bash
    yarn install
    ```

2. **Run the build script:**
   The following command will compile the TypeScript code from the `lib` directory and output the result in the `dist` directory.
    ```bash
    yarn tsc --target es5 --lib es2021,DOM --moduleResolution node --strict --esModuleInterop --declaration --jsx react --skipLibCheck --outDir dist --rootDir lib lib/*.ts lib/**/*.ts lib/**/*.tsx && cp package.json README.md dist/ && find lib/ -type f -name '*.css' -exec sh -c 'cp {} $(echo {} | sed s/^lib/dist/)' \\;
    ```
    This command does the following:

-   Compiles TypeScript files to JavaScript.
-   Copies `package.json` and `README.md` to the `dist` folder.
-   Copies any `.css` files to the `dist` folder, preserving the directory structure.
