const { v4 } = require("uuid");
const osPath = require("path");

const {
  readFromFile,
  writeFile,
  readFromFileCb,
  writeToFile,
} = require("./util/file-process");

class DropDB {
  constructor(path) {
    if (path) {
      if (typeof path !== "string")
        throw new TypeError("DROPDB: Path should be a string value");
      this._path = osPath.join(__dirname, path, "db.json");
    } else {
      this._path = osPath.join(__dirname, "/db.json");
    }

    // Clear the file with [] if no data is available
    readFromFileCb(this._path, (dataArray) => {
      if (dataArray.length === 0) writeFile(this._path, []);
    });
  }

  set path(path) {
    if (typeof path !== "string")
      throw new TypeError("DROPDB: Path should be a string value");
    this._path = path + ".json";
  }

  async put(path, object, cb) {
    if (cb) {
      if (typeof cb !== "function")
        throw new TypeError("DROPDB: Callback should be a function");
    }

    try {
      if (!this._path) throw new Error("DROPDB: DB path is not provided");
      if (typeof path !== "string")
        throw new TypeError("DROPDB: Object path should be string");
      if (typeof object !== "object")
        throw new TypeError("DROPDB: Object should be passed as data");
      const dataArray = await readFromFile(this._path);

      const itemId = v4();
      object.id = itemId;

      let existPath = false;
      for (let item of dataArray) {
        if (item[path]) {
          existPath = true;
          item[path].push(object);
          break;
        }
      }

      if (!existPath) dataArray.push({ [path]: [object] });

      await writeToFile(this._path, dataArray);

      if (cb) cb(null, itemId, object);
    } catch (err) {
      if (cb) cb(err);
      else throw err;
    }
  }

  async getById(path, id, cb) {
    if (typeof cb !== "function")
      throw new TypeError("DROPDB: Callback should be a function");

    try {
      if (typeof path !== "string")
        throw new TypeError("DROPDB: Path should be a string value");
      if (typeof id !== "string")
        throw new TypeError("DROPDB: Id should be a string value");

      const dataArray = await readFromFile(this._path);

      let dataPath = null;
      for (let item of dataArray) {
        if (item[path]) {
          dataPath = item[path];
          break;
        }
      }

      if (dataPath !== null) {
        let dataItem = null;
        for (let item of dataPath) {
          if (item.id === id) {
            dataItem = item;
            break;
          }
        }
        cb(null, dataItem);
      } else {
        cb(null, dataPath);
      }
    } catch (err) {
      cb(err);
    }
  }

  get path() {
    return this._path;
  }
}

module.exports = DropDB;
