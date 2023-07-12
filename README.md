# Polyfact

`polyfact` is a nodejs package aimed at assisting developers in creating project using AI.
The package is split into 2 parts:
  -  The [**SDK**](#sdk) that can be imported in any nodejs project and provides the basic building blocks for AI tool developement
  -  The [**CLI**](#cli) which is a bundle of dev-tools currently under active development, with documentation autogeneration as its functional feature at this stage.

## SDK

### Installation

To install polyfact into your repository:
```bash
npm install polyfact
```

Get your your polyfact token by signing up with github here: https://app.polyfact.com
Add your Polyfact Token in the `POLYFACT_TOKEN` environment variable:
```bash
export POLYFACT_TOKEN= # The token displayed on https://app.polyfact.com
```

### Usage

You can now use Polyfact in your nodejs project:
```js
import { generateWithType } from "polyfact";
import * as t from "io-ts";

(async () => {
    const result = await generateWithType("Count from 1 to 5", t.type({ result: t.array(t.number) }));

    console.log(result);
})();
```
```bash
{ result: [1, 2, 3, 4, 5] }
```

## CLI

`polyfact` uses the following command structure for documentation generation:

```bash
npx polyfact docs <folder> [options]
```

### Arguments

- `<folder>`: This is the path of the folder from which to generate the documentation. This argument is mandatory.

### Options

- `-n, --name <doc_name>`: This is the name of the documentation. If not provided, it defaults to 'id'.

- `-d, --deploy <subdomain>`: This option allows you to provide a subdomain to which the generated documentation will be deployed.

- `--doc_id <doc_id>`: If the doc_id has already been generated, you can send it as an argument here.

## Examples

```bash
# Generate documentation from the src folder with the default parameters
npx polyfact docs ./src 

# Generate documentation with a specific name from the src folder and output to a specific folder
npx polyfact docs ./src --name "my-documentation"

# Generate documentation and deploy it to a specific subdomain
npx polyfact docs ./src --deploy my-subdomain
```

## Future Enhancements

`polyfact` is planned to support more dev-tools features in the near future. Stay tuned for more enhancements that would aid you with AI features.
