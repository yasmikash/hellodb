const fs = require("fs");

const readFromFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(new Error("DROPDB: Could not retrieve data"));
      resolve(JSON.parse(data));
    });
  });
};

const writeToFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(data), (err) => {
      if (err) reject(new Error("DROPDB: Could not write data"));
      resolve(true);
    });
  });
};

const readFromFileCb = (path, cb) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      // Write with empty [] if no file exists
      if (err.code === "ENOENT") {
        writeToFile(path, [], () => readFromFile(path, cb));
      } else {
        throw new Error("DROPDB: Could not read data");
      }
    } else {
      cb(data);
    }
  });
};

const writeToFileCb = (path, data, cb) => {
  fs.writeFile(path, JSON.stringify(data), (err) => {
    if (err) throw new Error("DROPDB: Could not write data");
    else cb();
  });
};

module.exports = {
  readFromFile,
  writeToFile,
  readFromFileCb,
  writeToFileCb,
};
