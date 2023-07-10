# polyfact-node

`polyfact-node` is a CLI nodejs package aimed at assisting developers in creating project using AI. This bundle of dev-tools is currently under active development, with documentation autogeneration as its functional feature at this stage.

## Installation

To install polyfact-node, you'll need Node.js installed on your computer. 

To install globally from your command line:
```bash
yarn global add polyfact
```
Or
```bash
npm install -g polyfact
```

You can verify the installation with the following command:

```bash
polyfact --version
```

## Command

`polyfact-node` uses the following command structure for documentation generation:

```bash
polyfact docs <folder> [options]
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
polyfact docs ./src 

# Generate documentation with a specific name from the src folder and output to a specific folder
polyfact docs ./src --name "my-documentation"

# Generate documentation and deploy it to a specific subdomain
polyfact docs ./src --deploy my-subdomain
```

## Future Enhancements

`polyfact-node` is planned to support more dev-tools features in the near future. Stay tuned for more enhancements that would aid you with AI features.
