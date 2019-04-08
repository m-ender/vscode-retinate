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

function download(url, destination) {
    return new Promise((resolve, reject) => {
        http.get(url, response => {
            const file = fs.createWriteStream(destination);
            response.pipe(file);
            file.on('finish', () => file.close(() => resolve(destination)));
            file.on('error', error => reject(error));
        });
    });
}

function untar(path) {
    return new Promise((resolve, reject) => {
        const file = fs.createReadStream(path);
        const pipe = file.pipe(gunzip()).pipe(tar.extract(directory));
        pipe.on('finish', () => resolve(path));
        pipe.on('error', error => reject(error));
    });
}

if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
}

console.log(`Downloading version [${version}] to [${directory}] for platforms [${platforms}]...`);
platforms.forEach(platform => {
    download(format(template, version, platform), `${directory}/${platform}.tmp`)
        .then(untar)
        .then(() => console.log(`Successfully downloaded and unpacked [${platform}]`))
        .catch(console.error);
});
