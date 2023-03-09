console.clear();
console.log(" ");
console.log("\x1b[31m%s\x1b[0m", "     ██╗██╗███╗   ███╗██████╗ ██╗  ██╗ █████╗ ███████╗██╗  ██╗███████╗██████╗ \n     ██║██║████╗ ████║██╔══██╗██║  ██║██╔══██╗██╔════╝██║  ██║██╔════╝██╔══██╗\n     ██║██║██╔████╔██║██████╔╝███████║███████║███████╗███████║█████╗  ██████╔╝\n██   ██║██║██║╚██╔╝██║██╔═══╝ ██╔══██║██╔══██║╚════██║██╔══██║██╔══╝  ██╔══██╗\n╚█████╔╝██║██║ ╚═╝ ██║██║     ██║  ██║██║  ██║███████║██║  ██║███████╗██║  ██║\n ╚════╝ ╚═╝╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ \n                                                               by @stealtosvra \n");

const fs = require('fs');
const Jimp = require('jimp');
const cliProgress = require('cli-progress');

const config = require('./config.json');

const { hashSize, hashFilePath, imageDirectory } = config;

const files = fs.readdirSync(imageDirectory);

let promises = [];

const bar = new cliProgress.SingleBar({
  format: ' [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | Duration: {duration}s',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
}, cliProgress.Presets.rect);

bar.start(files.length, 0);

files.forEach(file => {
  if (file.endsWith('.png')) {
    const imagePath = `${imageDirectory}/${file}`;
    const promise = Jimp.read(imagePath)
      .then(image => {
        const hash = image.hash(hashSize);
        bar.increment();
        return { hash, imagePath };
      })
      .catch(err => console.error(err));
    promises.push(promise);
  }
});

Promise.all(promises)
  .then(results => {
    bar.stop();
    const hashes = results.map(result => ({ ...result, hashFilePath }));
    fs.writeFile(hashFilePath, JSON.stringify(hashes), err => {
      if (err) {
        console.error(err);
      } else {
        console.log(`  ${files.length} Hashes saved to ${hashFilePath}`);
      }
    });
  })
  .catch(err => console.error(err));
