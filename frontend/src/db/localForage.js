import localforage from "localforage";

const store = localforage.createInstance({
  name: "agrishield-offline-logs"
});

export const saveScanLog = async (log) => {
  await store.setItem(log.id || Date.now().toString(), log);
};

export const getAllScanLogs = async () => {
  const logs = [];
  await store.iterate((value) => {
    logs.push(value);
  });
  return logs;
};

export const getUnsyncedLogs = async () => {
  const logs = [];
  await store.iterate((value) => {
    if (!value.synced) logs.push(value);
  });
  return logs;
};

export const markLogsSynced = async (keys) => {
  for (const key of keys) {
    const log = await store.getItem(key);
    if (log) {
      log.synced = true;
      await store.setItem(key, log);
    }
  }
};
