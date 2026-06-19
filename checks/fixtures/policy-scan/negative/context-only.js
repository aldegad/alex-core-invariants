const policyWordsInAString = "fallback legacy dual-write catch (error) { return null; }";
const policyWordsInATemplate = `silent fallback and shadow path are explanatory text`;
const policyWordsInARegex = /fallback|legacy|dual-write/;

// fallback legacy dual-write catch (error) { return null; }
/*
 * silent fallback, shadow path, and write both are documentation examples here.
 */
export function explicitFailure(primaryStore) {
  try {
    return primaryStore.read();
  } catch (error) {
    throw error;
  }
}
