import { setCustomers, setInventoryItems, setServiceItems, setSpendings, setVehicles, setWorkOrderAssignments, setWorkOrders, setWorkOrderLineItems, setWorkOrderLogs, setWorkers } from "./redux/actions";
import { getAllOfCollection } from "./utils";

const initialFetches = [
    {
        name: "customers", fetcher: async () => {
            let Customers = await getAllOfCollection("customers");
            console.log("Customers", Customers)
            return Customers;
        },
        reduxAction: setCustomers
    },
    {
        name: "inventoryItems", fetcher: async () => {
            let InventoryItems = await getAllOfCollection("inventoryItems");
            console.log("InventoryItems", InventoryItems)
            return InventoryItems;
        },
        reduxAction: setInventoryItems
    },
    {
        name: "serviceItems", fetcher: async () => {
            let ServiceItems = await getAllOfCollection("serviceItems");
            console.log("ServiceItems", ServiceItems)
            return ServiceItems;
        },
        reduxAction: setServiceItems
    },
    {
        name: "spendings", fetcher: async () => {
            let Spendings = await getAllOfCollection("spendings");
            console.log("Spendings", Spendings)
            return Spendings;
        },
        reduxAction: setSpendings
    },
    {
        name: "vehicles", fetcher: async () => {
            let Vehicles = await getAllOfCollection("vehicles");
            console.log("Vehicles", Vehicles)
            return Vehicles;
        },
        reduxAction: setVehicles
    },
    {
        name: "workOrderAssignments", fetcher: async () => {
            let WorkOrderAssignments = await getAllOfCollection("workOrderAssignments");
            console.log("WorkOrderAssignments", WorkOrderAssignments)
            return WorkOrderAssignments;
        },
        reduxAction: setWorkOrderAssignments
    },
    {
        name: "workOrders", fetcher: async () => {
            let WorkOrders = await getAllOfCollection("workOrders");
            console.log("WorkOrders", WorkOrders)
            return WorkOrders;
        },
        reduxAction: setWorkOrders
    },
    {
        name: "workOrderLineItems", fetcher: async () => {
            let WorkOrderLineItems = await getAllOfCollection("workOrderLineItems");
            console.log("WorkOrderLineItems", WorkOrderLineItems)
            return WorkOrderLineItems;
        },
        reduxAction: setWorkOrderLineItems
    },
    {
        name: "workOrderLogs", fetcher: async () => {
            let WorkOrderLogs = await getAllOfCollection("workOrderLogs");
            console.log("WorkOrderLogs", WorkOrderLogs)
            return WorkOrderLogs;
        },
        reduxAction: setWorkOrderLogs
    },
    {
        name: "workers", fetcher: async () => {
            let Workers = await getAllOfCollection("workers");
            console.log("Workers", Workers)
            return Workers;
        },
        reduxAction: setWorkers
    }
]

export default async function getInitialStates(reduxDispatchHook) {
    initialFetches.forEach((obj) => {
        obj.fetcher().then((data) => {
            reduxDispatchHook(obj.reduxAction(data));
        })
    })

}