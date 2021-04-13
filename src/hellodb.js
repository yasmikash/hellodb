const { v4 } = require("uuid");
const osPath = require("path");
const EventEmitter = require("events");

const { readFromFile, writeToFile } = require("./util/file-process");

class HelloDB extends EventEmitter {
  constructor(path) {
    super();
    if (path) {
      if (typeof path !== "string")
        throw new TypeError("HELLODB: Path should be a string value");
      this._path = osPath.join(osPath.resolve("./"), path, "/db.json");
    } else {
      this._path = osPath.join(osPath.resolve("./"), "/db.json");
    }

    const initDB = async () => {
      try {
        try {
          await readFromFile(this._path);
        } catch (err) {
          if (err.code === "ENOENT") await writeToFile(this._path, []);
        }
      } catch (err) {
        throw new Error("HELLODB: Init database failed");
      }
      this.emit("ready");
    };

    // Clear the file with [] if no data is available
    initDB();
  }

  set path(path) {
    if (typeof path !== "string")
      throw new TypeError("HELLODB: Path should be a string value");
    this._path = path + ".json";
  }

  async put(path, object) {
    try {
      if (typeof path !== "string")
        throw new TypeError("HELLODB: Path should be a string value");
      if (typeof object !== "object")
        throw new TypeError("HELLODB: Data should be passed as object");
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

      return object;
    } catch (err) {
      throw err;
    }
  }

  async getById(path, id) {
    try {
      if (typeof path !== "string")
        throw new TypeError("HELLODB: Path should be a string value");
      if (typeof id !== "string")
        throw new TypeError("HELLODB: Id should be a string value");

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
        return dataItem;
      } else {
        return null;
      }
    } catch (err) {
      throw err;
    }
  }

  async editById(path, id, object) {
    try {
      if (typeof path !== "string")
        throw new TypeError("HELLODB: Path should be string value");
      if (typeof id !== "string")
        throw new TypeError("HELLODB: Id should be passed as data");
      if (typeof object !== "object")
        throw new TypeError("HELLODB: Data should be passed as object");

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

          return dataItem;
        } else {
          return dataItem;
        }
      } else {
        return null;
      }
    } catch (err) {
      throw err;
    }
  }

  async deleteById(path, id) {
    try {
      if (typeof path !== "string")
        throw new TypeError("HELLODB: Path should be string value");
      if (typeof id !== "string")
        throw new TypeError("HELLODB: Id should be passed as data");

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

        // Ready to be removed the data from db
        if (dataItem) {
          dataArray[pathDataIndex][path].splice(
            dataItemIndex,
            dataItemIndex + 1
          );

          await writeToFile(this._path, dataArray);
          return dataItem;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (err) {
      throw err;
    }
  }

  async getPathData(path, cb) {
    if (typeof cb !== "function")
      throw new TypeError("HELLODB: Callback should be a function");

    try {
      if (typeof path !== "string")
        throw new TypeError("HELLODB: Path should be a string value");

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

module.exports = HelloDB;
