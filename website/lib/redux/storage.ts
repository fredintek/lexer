import createWebStorage from "redux-persist/lib/storage/createWebStorage";

// This function creates a dummy storage for the Server
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// If we are in the browser, use real localStorage.
// If we are on the server, use the dummy "noop" storage.
const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

export default storage;
