import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDv8AbPqdEF47zKwDZHhnsIGIlJMg6zer0",
  authDomain: "blog-cao.firebaseapp.com",
  projectId: "blog-cao",
  storageBucket: "blog-cao.appspot.com",
  messagingSenderId: "331259749293",
  appId: "1:331259749293:web:f6afdfe6b24fc9b5d07724",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage };
