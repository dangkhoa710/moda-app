import { openDB } from "idb";

export const getDB = () =>
  openDB("ImageDatabase", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images");
      }
    },
  });