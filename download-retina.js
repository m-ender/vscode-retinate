const http = require('follow-redirects').https;
const fs = require('fs');
const tar = require('tar-fs');
const gunzip = require('gunzip-maybe');

const download = function (url, destination) {
    const file = fs.createWriteStream(destination);
    http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => {
                fs.createReadStream(destination).pipe(gunzip()).pipe(tar.extract("."));
            });
        });
    });
};

binaries = [{
    url: 'https://github.com/m-ender/retina/releases/download/v1.1.1/retina-win-x64.tar.gz',
    name: 'win'
}, {
    url: 'https://github.com/m-ender/retina/releases/download/v1.1.1/retina-linux-x64.tar.gz',
    name: 'linux'
}];

console.log("Downloading...");
for (binary of binaries) {
    download(binary['url'], binary['name']);
}
