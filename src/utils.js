import firebaseSDK from "./firebase/firebase.config";
import { useEffect, useState } from "react";




const Firestore = firebaseSDK.firestore;

/**get all documents from a specific collection */
export const getAllOfCollection = async (collectionName) => {

    return new Promise((resolve, reject) => {
        if (!collectionName)
            reject("Collection name is required");
        Firestore.collection(collectionName).onSnapshot((snapshot) => {
            let data = snapshot?.docs?.map((obj) => {
                if (obj.exists)
                    return obj?.data();
                else return null;
            });

            resolve(data?.filter((item) => item));

        })

    });


}
export const getDocumentById = async (collection, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            Firestore.collection(collection).where("_id", "==", id).onSnapshot((snapshot) => {
                console.log("snapshot-----", snapshot)
                let data = snapshot.docs.map((doc) => doc.data());
                console.log("inside-data", data);
                let obj = data[0];
                resolve(obj);
            });

        }
        catch (e) {
            reject(e);
        }
    })

}

export const createUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
};



export const saveData = async (collection, obj) => {

    return new Promise(async (resolve, reject) => {

        try {
            await Firestore.collection(collection).doc(obj?._id).set(obj, { merge: true });
            resolve(true);

        } catch (e) {
            reject(e);
        }


    })


}

export const useSearch = (items = [], criteria = (item) => { return "" }) => {
    const [currentItems, setCurrentItems] = useState(items);
    const [value, setValue] = useState("");


    useEffect(() => {
        setCurrentItems(items);
    }, [items])


    const handleSearch = () => {
        console.log("Searching......", value?.trim())
        if (!value?.trim()) { setCurrentItems(items); return }
        let filteredItems = [...items]?.filter((item) => {
            let searchCriteria = criteria(item)?.toUpperCase();
            return searchCriteria?.includes(value?.toUpperCase())

        })
        setCurrentItems(filteredItems);
    }

    useEffect(() => {
        handleSearch()
    }, [value])



    return { currentItems, setCurrentItems, value, setValue }

}