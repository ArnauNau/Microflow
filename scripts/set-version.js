import { writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const packageJsonPath = resolve(__dirname, "../package.json");
const versionFilePath = resolve(__dirname, "../src/version.ts");

const colors = {
    reset: "\x1b[0m",
    purple: "\x1b[35m",
    green: "\x1b[32m",
    bold: "\x1b[1m",
    red: "\x1b[31m"
};

try {
    // Read package.json as a string and parse it as JSON
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

    const version = packageJson.version;
    if (!version) throw new Error("Version not found in package.json");

    const versionContent = readFileSync(versionFilePath, "utf8").split("\n");
    const currentVersion = versionContent[0].match(/'([^']+)'/)[1];

    if (currentVersion !== version) {
        versionContent[0] = `export const VERSION = '${version}';`;
        writeFileSync(versionFilePath, versionContent.join("\n"), "utf8");
        console.log(`${colors.green}✔${colors.reset} Version updated to ${colors.bold}${colors.purple}${version}${colors.reset} in version.ts${colors.reset}.`);
    } else {
        console.log(`${colors.green}✔${colors.reset} Version in version.ts is already up to date (${colors.bold}${colors.purple}${version}${colors.reset}).`);
    }

} catch (error) {
    console.error(`\n${colors.red}❌ Failed to update version.ts: ${error.message}. ${colors.reset}\n`);
    process.exit(1);
}