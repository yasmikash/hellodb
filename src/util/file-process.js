const fs = require("fs");

const readFromFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          const error = new Error("DROPDB: Could not read data");
          error.code = "ENOENT";
          reject(error);
        } else {
          reject(new Error("DROPDB: Could not read data"));
        }
      } else resolve(JSON.parse(data));
    });
  });
};

const writeToFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(data), (err) => {
      if (err) reject(new Error("DROPDB: Could not write data"));
      else resolve(true);
    });
  });
};

module.exports = {
  readFromFile,
  writeToFile,
};
