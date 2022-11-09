# @tjmora/g-font-cli

A CLI tool for downloading Google Fonts.

## Installation

```
npm i @tjmora/g-font-cli
```

### Usage

In your package.json, add the following script:

```json
{
  ...
  "scripts": {
    ...
    "g-font": "node node_modules/@tjmora/g-font-cli/dist/cli.js"
  }
  ...
}
```

To download Google Fonts, use the following command:

```
npm run g-font download <installation_path> <google_fonts_api_url>
```

Make sure to surround the installation path and URL with quote marks. For example:

```
npm run g-font download "public/fonts" "https://fonts.googleapis.com/css2?family=Roboto&family=Lato:ital,wght@1,400&family=Raleway:wght@300;400;700&display=swap"
```

Once downloaded, add the following stylesheet `<link>` tag to your app, document, or 
layout file/component (within `<head>` tags).

```
<link href="fonts/index.css" rel="stylesheet" />
```

Replace the `href` attribute as needed. It should point to the index.css generated 
in the installation path.