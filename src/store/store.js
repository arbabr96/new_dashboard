import { createStore } from "redux";
import Reducers from "./reducers";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["auth"],
};

// const persistedReducer = persistReducer(persistConfig, Reducers);

const store = createStore(Reducers);

// const store = () => {
//   let store = createStore(persistedReducer);
//   let persistor = persistStore(store);
//   return { store, persistor };
// };
export default store;
