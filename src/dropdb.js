const { v4 } = require("uuid");
const osPath = require("path");

const {
  readFromFile,
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
    readFromFileCb(this._path, () => {});
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
      if (typeof path !== "string")
        throw new TypeError("DROPDB: Path should be a string value");
      if (typeof object !== "object")
        throw new TypeError("DROPDB: Data should be passed as object");
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

      let pathData = null;
      for (let item of dataArray) {
        if (item[path]) {
          pathData = item[path];
          break;
        }
      }

      if (pathData !== null) {
        let dataItem = null;
        for (let item of pathData) {
          if (item.id === id) {
            dataItem = item;
            break;
          }
        }
        cb(null, dataItem);
      } else {
        cb(null, null);
      }
    } catch (err) {
      cb(err);
    }
  }

  async editById(path, id, object, cb) {
    if (cb) {
      if (typeof cb !== "function")
        throw new TypeError("DROPDB: Callback should be a function");
    }

    try {
      if (typeof path !== "string")
        throw new TypeError("DROPDB: Path should be string value");
      if (typeof id !== "string")
        throw new TypeError("DROPDB: Id should be passed as data");
      if (typeof object !== "object")
        throw new TypeError("DROPDB: Data should be passed as object");

      const dataArray = await readFromFile(this._path);

      let pathData = null;
      let pathDataIndex = 0;
      for (let item of dataArray) {
        if (item[path]) {
          pathData = item[path];
          break;
        }
        pathDataIndex++;
      }

      if (pathData !== null) {
        let dataItem = null;
        let dataItemIndex = 0;
        for (let item of pathData) {
          if (item.id === id) {
            dataItem = item;
            break;
          }
          dataItemIndex++;
        }

        // Prepare the data to be updated in the db
        if (dataItem !== null) {
          const itemId = dataItem.id;
          dataItem = { ...dataItem, ...object, id: itemId };
          dataArray[pathDataIndex][path][dataItemIndex] = dataItem;

          await writeToFile(this._path, dataArray);

          if (cb) cb(null, dataItem);
        } else {
          cb(null, dataItem);
        }
      } else {
        cb(null, null);
      }
    } catch (err) {
      cb(err);
    }
  }

  async getPathData(path, cb) {
    if (typeof cb !== "function")
      throw new TypeError("DROPDB: Callback should be a function");

    try {
      if (typeof path !== "string")
        throw new TypeError("DROPDB: Path should be a string value");

      const dataArray = await readFromFile(this._path);

      let pathData = null;
      for (let item of dataArray) {
        if (item[path]) {
          pathData = item[path];
          break;
        }
      }
      cb(null, pathData);
    } catch (err) {
      cb(err);
    }
  }

  get path() {
    return this._path;
  }
}

module.exports = DropDB;
