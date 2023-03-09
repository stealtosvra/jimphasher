console.clear();
console.log(" ");
console.log("\x1b[31m%s\x1b[0m", "     ██╗██╗███╗   ███╗██████╗ ██╗  ██╗ █████╗ ███████╗██╗  ██╗███████╗██████╗ \n     ██║██║████╗ ████║██╔══██╗██║  ██║██╔══██╗██╔════╝██║  ██║██╔════╝██╔══██╗\n     ██║██║██╔████╔██║██████╔╝███████║███████║███████╗███████║█████╗  ██████╔╝\n██   ██║██║██║╚██╔╝██║██╔═══╝ ██╔══██║██╔══██║╚════██║██╔══██║██╔══╝  ██╔══██╗\n╚█████╔╝██║██║ ╚═╝ ██║██║     ██║  ██║██║  ██║███████║██║  ██║███████╗██║  ██║\n ╚════╝ ╚═╝╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ \n                                                               by @stealtosvra \n");

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const ProgressBar = require('cli-progress');
const config = require('./config.json');

const directory = config.imageDirectory;
const hashSize = config.hashSize;

const files = fs.readdirSync(directory).filter(file => file.endsWith('.png'));
const hashToFilenameMap = new Map(); // Map to keep track of filename and its hash
const promises = [];

// Initialize progress bar
const bar = new ProgressBar.SingleBar({
  format: ' [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | Duration: {duration}s',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});
bar.start(files.length, 0);

files.forEach((file, index) => {
  const imagePath = path.join(directory, file);
  const promise = Jimp.read(imagePath)
    .then(image => {
      const hash = image.hash(hashSize); // Get the hash of the image
      const extname = path.extname(file); // Get the file extension
      const newFilename = `${hash}${extname}`; // Create new filename with hash
      const newImagePath = path.join(directory, newFilename); // Create new image path
      
      if (hashToFilenameMap.has(hash)) {
        // If a file with the same hash exists, delete the current file
        fs.unlinkSync(imagePath);
        bar.increment();
      } else {
        // If no file with the same hash exists, rename the file with the hash
        fs.renameSync(imagePath, newImagePath);
        hashToFilenameMap.set(hash, newFilename); // Add the hash and new filename to the map
        bar.increment();
      }
    })
    .catch(err => console.error(err));
  promises.push(promise);
});

// Wait for all promises to resolve before continuing
Promise.all(promises)
  .then(() => {
    bar.stop();
    console.log(`  ${files.length} Images Hashed & Renamed.`);
  })
  .catch(err => console.error(err));
