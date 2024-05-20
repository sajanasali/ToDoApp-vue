//import firebase from 'firebase';
import "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyBavUGQVmMQlmeyhZ-sNXXwmOJ3RSY3e0w",
    authDomain: "todo-crud-65300.firebaseapp.com",
    projectId: "todo-crud-65300",
    storageBucket: "todo-crud-65300.appspot.com",
    messagingSenderId: "504197501997",
    appId: "1:504197501997:web:35e994819125a4341294a4",
    measurementId: "G-K7MWM5SDBZ"
  };


  const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
 // export const db=firebase.initializeApp(firebaseConfig).firestore;