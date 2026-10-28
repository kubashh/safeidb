import { STORAGE_NAME, type StorageKey } from "./consts";
import { openAppDB, requestToPromise } from "./util";

class SafeIDB {
  db: IDBDatabase | null = null;

  constructor() {
    this.db = null;
  }

  async run<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T>,
  ): Promise<T> {
    if (!this.db) this.db = await openAppDB();
    const tx = this.db.transaction(STORAGE_NAME, mode);
    const done = new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => {
        throw tx.error ?? new Error("Transaction aborted");
      };
      tx.onerror = () => {
        tx.abort();
        throw tx.error ?? new Error("Transaction failed");
      };
    });

    try {
      const result = await operation(tx.objectStore(STORAGE_NAME));
      await done;
      return result;
    } catch (error) {
      try {
        tx.abort();
      } catch {
        // transaction may already have completed or aborted.
      }

      await done.catch(() => undefined);
      throw error;
    }
  }

  async getItem<T = unknown>(key: StorageKey): Promise<T | null> {
    const value = await this.run("readonly", (store) =>
      requestToPromise(store.get(key)),
    );

    return (value as T) ?? null;
  }

  async setItem<T>(key: StorageKey, value: T): Promise<void> {
    await this.run("readwrite", (store) =>
      requestToPromise(store.put(value, key)),
    );
  }

  async removeItem(key: StorageKey): Promise<void> {
    await this.run("readwrite", (store) => requestToPromise(store.delete(key)));
  }

  async clear(): Promise<void> {
    await this.run("readwrite", (store) => requestToPromise(store.clear()));
  }

  async length(): Promise<number> {
    return this.run("readonly", (store) => requestToPromise(store.count()));
  }

  async keys(): Promise<StorageKey[]> {
    return this.run("readonly", (store) =>
      requestToPromise(store.getAllKeys()),
    );
  }
}

export const safeidb = new SafeIDB();
