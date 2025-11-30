import { SET_USER, SET_CUSTOMERS, SET_INVENTORYITEMS, SET_SERVICEITEMS, SET_SPENDINGS, SET_VEHICLES, SET_WORKORDERASSIGNMENTS, SET_WORKORDERS, SET_WORKORDERLINEITEMS, SET_WORKORDERLOGS, SET_WORKERS } from "../types";
import firebaseSDK from "../../firebase/firebase.config";

export const setUser = (user) => {
    return {
        type: SET_USER,
        payload: user
    }
}

export const setCustomers = (customers) => {
    return {
        type: SET_CUSTOMERS,
        payload: customers
    }
}

export const setInventoryItems = (inventoryItems) => {
    return {
        type: SET_INVENTORYITEMS,
        payload: inventoryItems
    }
}

export const setServiceItems = (serviceItems) => {
    return {
        type: SET_SERVICEITEMS,
        payload: serviceItems
    }
}

export const setSpendings = (spendings) => {
    return {
        type: SET_SPENDINGS,
        payload: spendings
    }
}

export const setVehicles = (vehicles) => {
    return {
        type: SET_VEHICLES,
        payload: vehicles
    }
}

export const setWorkOrderAssignments = (workOrderAssignments) => {
    return {
        type: SET_WORKORDERASSIGNMENTS,
        payload: workOrderAssignments
    }
}

export const setWorkOrders = (workOrders) => {
    return {
        type: SET_WORKORDERS,
        payload: workOrders
    }
}

export const setWorkOrderLineItems = (workOrderLineItems) => {
    return {
        type: SET_WORKORDERLINEITEMS,
        payload: workOrderLineItems
    }
}

export const setWorkOrderLogs = (workOrderLogs) => {
    return {
        type: SET_WORKORDERLOGS,
        payload: workOrderLogs
    }
}

export const setWorkers = (workers) => {
    return {
        type: SET_WORKERS,
        payload: workers
    }
}

export const createWorkOrder = (workOrder) => async (dispatch) => {
    try {
        const docRef = await firebaseSDK.firestore.collection("WorkOrders").add(workOrder);
        return docRef.id;
    } catch (error) {
        console.error("Error creating work order:", error);
    }
};

export const fetchWorkOrders = () => async (dispatch) => {
    try {
        const snapshot = await firebaseSDK.firestore.collection("WorkOrders").get();
        const workOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dispatch(setWorkOrders(workOrders));
    } catch (error) {
        console.error("Error fetching work orders:", error);
    }
};

export const fetchCustomers = () => async (dispatch) => {
    try {
        const snapshot = await firebaseSDK.firestore.collection("Customers").get();
        const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dispatch(setCustomers(customers));
    } catch (error) {
        console.error("Error fetching customers:", error);
    }
};

export const createCustomer = (customer) => async (dispatch) => {
    try {
        const docRef = await firebaseSDK.firestore.collection("Customers").add(customer);
        return docRef.id;
    } catch (error) {
        console.error("Error creating customer:", error);
    }
};

export const updateWorkOrder = (id, data) => async (dispatch) => {
    try {
        await firebaseSDK.firestore.collection("WorkOrders").doc(id).update(data);
        dispatch(fetchWorkOrders()); // Refresh list
    } catch (error) {
        console.error("Error updating work order:", error);
    }
};

export const deleteWorkOrder = (id) => async (dispatch) => {
    try {
        await firebaseSDK.firestore.collection("WorkOrders").doc(id).delete();
        dispatch(fetchWorkOrders()); // Refresh list
    } catch (error) {
        console.error("Error deleting work order:", error);
    }
};

export const fetchWorkers = () => async (dispatch) => {
    try {
        const snapshot = await firebaseSDK.firestore.collection("Workers").get();
        const workers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dispatch(setWorkers(workers));
    } catch (error) {
        console.error("Error fetching workers:", error);
    }
};

export const createWorker = (worker) => async (dispatch) => {
    try {
        await firebaseSDK.firestore.collection("Workers").add(worker);
        dispatch(fetchWorkers()); // Refresh list
    } catch (error) {
        console.error("Error creating worker:", error);
    }
};

export const deleteWorker = (id) => async (dispatch) => {
    try {
        await firebaseSDK.firestore.collection("Workers").doc(id).delete();
        dispatch(fetchWorkers()); // Refresh list
    } catch (error) {
        console.error("Error deleting worker:", error);
    }
};

export const updateWorker = (id, data) => async (dispatch) => {
    try {
        await firebaseSDK.firestore.collection("Workers").doc(id).update(data);
        dispatch(fetchWorkers()); // Refresh list
    } catch (error) {
        console.error("Error updating worker:", error);
    }
};

export const fetchInventoryItems = () => async (dispatch) => {
    try {
        const snapshot = await firebaseSDK.firestore.collection("InventoryItems").get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dispatch(setInventoryItems(items));
    } catch (error) {
        console.error("Error fetching inventory items:", error);
    }
};

export const createInventoryItem = (item) => async (dispatch) => {
    try {
        // Auto-generate SKU if not provided
        const itemData = {
            ...item,
            sku: item.sku || `SKU-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        await firebaseSDK.firestore.collection("InventoryItems").add(itemData);
        dispatch(fetchInventoryItems()); // Refresh list
    } catch (error) {
        console.error("Error creating inventory item:", error);
    }
};

export const updateInventoryItem = (id, data) => async (dispatch) => {
    try {
        await firebaseSDK.firestore.collection("InventoryItems").doc(id).update(data);
        dispatch(fetchInventoryItems()); // Refresh list
    } catch (error) {
        console.error("Error updating inventory item:", error);
    }
};

export const deleteInventoryItem = (id) => async (dispatch) => {
    try {
        await firebaseSDK.firestore.collection("InventoryItems").doc(id).delete();
        dispatch(fetchInventoryItems()); // Refresh list
    } catch (error) {
        console.error("Error deleting inventory item:", error);
    }
};

