#!/usr/bin/env node

import fs from "fs";
import https from "https";
import path from "path";
import gFontCopyrightData from "./gFontCopyrightData";
import fontLicenseTexts from "./fontLicenseTexts";

const [, , ...args] = process.argv;

interface IFontFile {
  fontName: string;
  url: string;
  fileName: string;
}

function pushUniqueFontFile(arr: IFontFile[], newFile: IFontFile) {
  let unique = true;
  for (let i = 0, l = arr.length; i < l; i++) {
    if (arr[i].url === newFile.url) {
      unique = false;
      break;
    }
  }
  if (unique) arr.push(newFile);
}

async function getPage(
  url: string
): Promise<{ success: boolean; message: string }> {
  let result = "";
  return new Promise((resolve) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        resolve({
          success: false,
          message: `Failed to download the stylesheet. Response status from accessing the Google Font API URL is ${response.statusCode}.`,
        });
        return;
      }
      response.on("data", (chunk) => {
        result += chunk;
      });
      response.on("end", () => {
        resolve({ success: true, message: result });
      });
    });
  });
}

async function downloadFont(
  url: string,
  dest: string
): Promise<{ success: boolean; message: string }> {
  const file = fs.createWriteStream(dest);
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        resolve({
          success: false,
          message: `Failed to download ${url}. Response status is ${response.statusCode}.`,
        });
        return;
      }
      response.pipe(file);
    });
    let breakNow = false;
    file.on("finish", () => {
      file.close(() => {
        resolve({ success: true, message: `Successfully downloaded ${url}.` });
        breakNow = true;
      });
    });
    if (breakNow) return;
    request.on("error", (err) => {
      fs.unlink(dest, () => {
        resolve({
          success: false,
          message: `Failed to downloaded ${url}. ${err.message}`,
        });
      });
    });
    file.on("error", (err) => {
      fs.unlink(dest, () => {
        resolve({
          success: false,
          message: `Failed to downloaded ${url}. ${err.message}`,
        });
      });
    });
  });
}

(async () => {
  if (!args.length) {
    console.log("No argument provided for the g-font/cli.");
    return;
  }

  if (args[0] === "download") {
    if (args.length < 3) {
      console.log(
        `The 'download' command needs a <public_path> and a <google_font_api_url> as parameters.`
      );
      return;
    }

    let destPath = args[1],
      apiUrl = args[2];

    let { success, message: content } = await getPage(apiUrl);
    if (!success) {
      console.log(content);
      return;
    }

    const fontFaces = content.match(/@font-face\s*\{[^}]+\}/g);
    if (!fontFaces) {
      console.log("The Google Font API response contains no font information.");
      return;
    }

    let fontFiles: IFontFile[] = [];
    fontFaces.forEach((fontFace) => {
      let fontName = fontFace
        .match(/(?<=font-family:\s*'\s*)[A-Za-z _-]+(?=\s*')/g)![0]
        .replace(" ", "_");
      let url = fontFace.match(/(?<=src:\s*url\()[^)]+(?=\))/g)![0];
      let fileName = url.slice(url.lastIndexOf("/") + 1);
      pushUniqueFontFile(fontFiles, { fontName, url, fileName });
    });

    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);

    for (let i = 0, l = fontFiles.length; i < l; i++) {
      content = content.replace(
        `url(${fontFiles[i].url})`,
        `url(${path.join(fontFiles[i].fontName, fontFiles[i].fileName)})`
      );
      if (!fs.existsSync(path.join(destPath, fontFiles[i].fontName)))
        fs.mkdirSync(path.join(destPath, fontFiles[i].fontName));
      const { success, message } = await downloadFont(
        fontFiles[i].url,
        path.join(destPath, fontFiles[i].fontName, fontFiles[i].fileName)
      );
      if (!success) {
        console.log(message);
        console.log("Operation aborted.");
        break;
      }
      console.log(message);
      if(gFontCopyrightData[fontFiles[i].fontName] !== undefined) {
        if (
          !fs.existsSync(path.join(destPath, fontFiles[i].fontName, gFontCopyrightData[fontFiles[i].fontName][0] + ".txt"))
        ) {
          const licenseContent =
            gFontCopyrightData[fontFiles[i].fontName][1] +
            "\n\n" +
            fontLicenseTexts[gFontCopyrightData[fontFiles[i].fontName][0]];
          fs.writeFileSync(
            path.join(destPath, fontFiles[i].fontName, gFontCopyrightData[fontFiles[i].fontName][0] + ".txt"),
            licenseContent
          );
        }
      }
      else {
        console.log(`The font ${fontFiles[i].fontName} doesn't have a copyright information. No copyright notice generated for the font.`);
      }
    }

    fs.writeFileSync(path.join(destPath, "index.css"), content);
    console.log("Successfully generated index.css");

    return;
  } else {
    console.log(`Unknown argument '${args[0]}' for the g-font/cli.`);
    return;
  }
})();
