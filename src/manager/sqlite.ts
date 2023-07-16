import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("todo", "1.0", "", 1);

const tableSchema = {
  commitment:
    "id integer primary key not null, time TIMESTAMP, cost float, done int, text text",
};

function addTable(table) {
  db.transaction((tx) => {
    tx.executeSql(
      `create table if not exists ${table} (${tableSchema[table]});`
    );
  });
}
function dropTable(table) {
  db.transaction((tx) => {
    tx.executeSql(`drop table ${table};`);
  });
}
export const execute = (sql) => {
  db.transaction(
    function (txn) {
      txn.executeSql(sql);
    },
    (error) => {
      console.log("error execute sql", error);
    },
    () => {
      console.log("success execute sql");
    }
  );
};
export const add = (table, item) => {
  addTable(table);
  db.transaction(
    function (txn) {
      txn.executeSql(
        `INSERT INTO ${table} (text, time) VALUES (:text, :time)`,
        [item.text, item.time]
      );
      txn.executeSql(`select * from ${table}`, [], (_, { rows }) =>
        console.log("rows", JSON.stringify(rows))
      );
    },
    (error) => {
      console.log("error add data", error);
    },
    () => {
      console.log("success add data");
    }
  );
};
export const addFull = (table, item) => {
  addTable(table);
  db.transaction(
    function (txn) {
      txn.executeSql(
        `INSERT INTO ${table} (cost, done, text, time) VALUES (:cost, :done, :text, :time)`,
        [item.cost, item.done, item.text, item.time]
      );
      txn.executeSql(`select * from ${table}`, [], (_, { rows }) =>
        console.log("rows", JSON.stringify(rows))
      );
    },
    (error) => {
      console.log("error add data", error);
      throw "error";
    },
    () => {
      console.log("success add data");
    }
  );
};
export const get = (table: string): Promise<any[]> => {
  return new Promise<any[]>((resolve, reject) => {
    let items = null;
    console.log("p1");
    db.transaction(
      function (txn) {
        txn.executeSql(
          `select * from ${table} order by time`,
          [],
          (_, { rows }) => {
            console.log("rows", JSON.stringify(rows));
            resolve(rows._array);
          }
        );
      },
      (error) => {
        console.log("error save data", error);
        reject(error);
      }
    );
  });
};
export const remove = (table, id): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    let items = null;
    db.transaction(
      function (txn) {
        txn.executeSql(`delete from ${table} where id=?`, [id], () => {
          resolve(true);
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};
export const update = (table, column, data): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    db.transaction(
      function (txn) {
        // txn.executeSql(`ALTER TABLE ${table} ADD ${column} INTEGER;`)
        let sql = `update ${table} set ${column}=? where id=?`;
        console.log("execute sql ", sql, data[column], data.id);
        txn.executeSql(sql, [data[column], data.id], () => {
          resolve(true);
        });
      },
      (error) => {
        if (table === "commitment") {
          // temp code for migration
          dropTable(table);
          addTable(table);
        }
        console.log(`error update ${table}`, error);
        reject(error);
      },
      () => {
        console.log(`Success update ${table}`);
        resolve();
      }
    );
  });
};
