const DB_NAME = "BookwardDB";
const STORE_NAME = "pdfs";
const PROGRESS_STORE_NAME = "progress";
const DB_VERSION = 2;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
  const db = request.result;

  if (!db.objectStoreNames.contains(STORE_NAME)) {
    db.createObjectStore(STORE_NAME);
  }

  if (
    !db.objectStoreNames.contains(
      PROGRESS_STORE_NAME
    )
  ) {
    db.createObjectStore(
      PROGRESS_STORE_NAME
    );
  }
};

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function savePdf(key, file) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    store.put(file, key);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function getPdf(key) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveReadingProgress(
  key,
  page
) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      PROGRESS_STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(
        PROGRESS_STORE_NAME
      );

    store.put(page, key);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function getReadingProgress(key) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      PROGRESS_STORE_NAME,
      "readonly"
    );

    const store =
      transaction.objectStore(
        PROGRESS_STORE_NAME
      );

    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}