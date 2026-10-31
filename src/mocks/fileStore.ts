/** Armazena os arquivos enviados no IndexedDB para que sobrevivam a um reload. */
const DB_NAME = 'porto-seco-mock';
const STORE = 'arquivos';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const fileStore = {
  save: (id: string, file: Blob) => run('readwrite', (store) => store.put(file, id)),
  get: (id: string) => run<Blob | undefined>('readonly', (store) => store.get(id)),
};
