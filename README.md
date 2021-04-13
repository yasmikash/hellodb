> Simple and lightweight JSON database that helps you perform CRUD operations using keys.

# Installation

Add `hellodb` to your existing Node.JS application.

`npm i hellodb --save`

# About

`hellodb` is a lightweight and simple package which helps you with all the basic CRUD operations you need to perform in your Node.JS project. It uses `uuid` version 4 to generate ids for your object data and store them as a `json` file in your project directory!

# Usage

```
const HelloDB = require("hellodb");

const db = new HelloDB();

db.on("ready", async () => {
  dbOps();
});

async function dbOps() {
  //===INSERT AN OBJECT //
  // ID is generated automatically when the user is stored in the json file.
  const insertedUser = await db.put("users", {
    username: "yasmikash",
    age: 24,
  });
  console.log(insertedUser);
  /*
    {
      username: 'yasmikash',
      age: 24,
      id: 'b7ed9198-b451-4a38-9e33-7d2bc02531d0'
    }
  */

  //===GET AN INSERTED OBJECT BY ID//
  const fetchedUser = await db.getById(
    "users",
    "b7ed9198-b451-4a38-9e33-7d2bc02531d0"
  );
  console.log(fetchedUser);
  /*
    {
      username: 'yasmikash',
      age: 24,
      id: 'b7ed9198-b451-4a38-9e33-7d2bc02531d0'
    }
  */

  //===EDIT AN INSERTED OBJECT BY ID//
  const updatedUser = await db.editById(
    "users",
    "b7ed9198-b451-4a38-9e33-7d2bc02531d0",
    {
      username: "taylor",
      age: 21,
      friends: [{ username: "yasmikash" }, { username: "bibi", age: 10 }],
    }
  );
  console.log(updatedUser);
  /*
    {
      username: 'taylor',
      age: 21,
      id: 'b7ed9198-b451-4a38-9e33-7d2bc02531d0',
      friends: [ { username: 'yasmikash' }, { username: 'bibi', age: 10 } ]
    }
  */

  const deletedUser = await db.deleteById(
    "users",
    "b7ed9198-b451-4a38-9e33-7d2bc02531d0"
  );
  console.log(deletedUser);
  /*
    {
      username: 'taylor',
      age: 21,
      id: 'b7ed9198-b451-4a38-9e33-7d2bc02531d0',
      friends: [ { username: 'yasmikash' }, { username: 'bibi', age: 10 } ]
    }
  */
}
```

Certain errors will be thrown if HelloDB is unable to perform the opetations. null is expected when the provided id or the path name do not exist in the `json` file.
