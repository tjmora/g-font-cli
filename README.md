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
    "g-font": "node ./node_modules/@tjmora/g-font-cli/dist/cli.js"
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

> **_NOTE:_** Appropriate copyright/license notices are also generated for each font.

Once downloaded, add the following stylesheet `<link>` tag to your app, document, or 
layout file/component (within `<head>` tags). The `href` attribute should point to the 
index.css generated in the installation path.

```
<link href="fonts/index.css" rel="stylesheet" />
```

If you still have the stylesheet `<link>` tags that point to the `<google_fonts_api_url>` 
that you provided to the g-font CLI, you can now delete those.