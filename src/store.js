const store = new Map();

export function createStateSlice({ key, initialValue, additionalMethods }) {
  const get = () => store.get(key);
  const set = (value) => store.set(key, value);

  set(initialValue);

  const entries = Object.entries(additionalMethods);
  const methodsConnectedToStore = entries.reduce(
    (accumulator, [name, callback]) => {
      accumulator[name] = callback({ get, set });
      return accumulator;
    },
    {}
  );

  return {
    get,
    set,
    ...methodsConnectedToStore
  };
}
