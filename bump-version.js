const fs = require("fs");
const path = require("path");

const versionFile = path.join(__dirname, "public", "version.txt");

let version = 0;
if (fs.existsSync(versionFile)) {
  version = parseInt(fs.readFileSync(versionFile, "utf8")) || 0;
}
version += 0.1;

fs.writeFileSync(versionFile, version.toString());
console.log(`📦 version bumped to v${version}`);
