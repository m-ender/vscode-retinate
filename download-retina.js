const http = require('follow-redirects').https;
const fs = require('fs');
const tar = require('tar-fs');
const gunzip = require('gunzip-maybe');

const download = function (url, destination, callback) {
    const file = fs.createWriteStream(destination);
    http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(callback);
        });
    });
}

const url = "https://github.com/m-ender/retina/releases/download/v1.1.1/retina-linux-x64.tar.gz";

console.log("Downloading...");
download(url, "file.tar.gz", () => {
    console.log("Unpacking...");
    fs.createReadStream("file.tar.gz").pipe(gunzip()).pipe(tar.extract("."));
    console.log("Ok.");
});
