const http = require('follow-redirects').https;
const fs = require('fs');
const tar = require('tar-fs');
const gunzip = require('gunzip-maybe');
const format = require('util').format;

const version = process.env.npm_package_retina_version || 'unknown-version';
const platforms = Object.keys(process.env)
    .filter(key => key.startsWith('npm_package_retina_platforms_'))
    .map(key => process.env[key]) || [];

const template = 'https://github.com/m-ender/retina/releases/download/%s/retina-%s.tar.gz';
const directory = 'bin';

if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
}

const download = function (url, destination) {
    const file = fs.createWriteStream(destination);
    http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => {
                fs.createReadStream(destination).pipe(gunzip()).pipe(tar.extract(directory));
            });
        });
    });
};

console.log(`Downloading version ${version} for platforms [${platforms}]...`);
platforms.forEach(platform => download(format(template, version, platform), `${directory}/${platform}.tmp`));
