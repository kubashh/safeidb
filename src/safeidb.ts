import "..";
import { STORAGE_NAME } from "./consts";
import { openAppDB, requestToPromise } from "./util";

class SafeIDB {
  private db: IDBDatabase | null = null;
  private operations: Symbol[] = [];

  constructor() {
    this.db = null;
    this.operations = [];
  }

  async getItem<T = unknown>(key: string): Promise<T | null> {
    const value: T = await this.run(`readonly`, (store) =>
      requestToPromise(store.get(key)),
    );

    return value ?? null;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await this.run(`readwrite`, (store) =>
      requestToPromise(store.put(value, key)),
    );
  }

  removeItem(key: string): Promise<void> {
    return this.run(`readwrite`, (store) =>
      requestToPromise(store.delete(key)),
    );
  }

  clear(): Promise<void> {
    return this.run(`readwrite`, (store) => requestToPromise(store.clear()));
  }

  length(): Promise<number> {
    return this.run(`readonly`, (store) => requestToPromise(store.count()));
  }

  keys(): Promise<string[]> {
    return new Promise(async (resolve) => {
      const keys = await this.run(`readonly`, (store) =>
        requestToPromise(store.getAllKeys()),
      );
      resolve(keys.map((key) => key.toString()));
    });
  }

  private async run<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T>,
  ): Promise<T> {
    if (!this.db) this.db = await openAppDB();
    const tx = this.db.transaction(STORAGE_NAME, mode);
    const done = new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => {
        throw tx.error ?? new Error(`Transaction aborted`);
      };
      tx.onerror = () => {
        tx.abort();
        throw tx.error ?? new Error(`Transaction failed`);
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
}

export const safeidb: TSafeIDB = new SafeIDB();
