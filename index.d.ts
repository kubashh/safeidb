type TSafeIDB = {
  getItem<T = unknown>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  length(): Promise<number>;
  keys(): Promise<string[]>;
  values<T>(): Promise<T[]>;
  entries<T>(): Promise<[string, T][]>;
  close(): void;
};

declare module "safeidb" {
  export const safeidb: TSafeIDB;
}
