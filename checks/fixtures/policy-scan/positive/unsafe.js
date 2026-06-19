export function readWithHiddenBackup(primaryStore, replicaStore) {
  const fallbackValue = replicaStore.read();
  const legacyStore = openLegacyStore();

  dualWrite(primaryStore, legacyStore);

  try {
    return primaryStore.read();
  } catch (error) { return fallbackValue; }
}
