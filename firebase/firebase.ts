import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import {
    doc,
    getFirestore,
    setDoc
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDv8AbPqdEF47zKwDZHhnsIGIlJMg6zer0",
    authDomain: "blog-cao.firebaseapp.com",
    projectId: "blog-cao",
    storageBucket: "blog-cao.appspot.com",
    messagingSenderId: "331259749293",
    appId: "1:331259749293:web:f6afdfe6b24fc9b5d07724"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app)

async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();

        const { user } = await signInWithPopup(auth, provider);

        const userDocRef = doc(db, "accounts", user.uid);

        await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
        }, { merge: true });

        return { uid: user.uid, displayName: user.displayName };
    } catch (error: any) {
        if (error.code !== 'auth/cancelled-popup-request') {
            console.error(error);
        }
        return null;
    }
}

async function signOut() {
    try {
        await auth.signOut();
    } catch (error: any) {
        console.log(error.message);
    }
}

export { loginWithGoogle, signOut, auth, app, db };
