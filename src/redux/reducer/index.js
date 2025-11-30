import { SET_USER, SET_CUSTOMERS, SET_INVENTORYITEMS, SET_SERVICEITEMS, SET_SPENDINGS, SET_VEHICLES, SET_WORKORDERASSIGNMENTS, SET_WORKORDERS, SET_WORKORDERLINEITEMS, SET_WORKORDERLOGS, SET_WORKERS } from "../types";

export const rootState = {
    user: null,
    customers: [],
    inventoryItems: [],
    serviceItems: [],
    spendings: [],
    vehicles: [],
    workOrderAssignments: [],
    workOrders: [],
    workOrderLineItems: [],
    workOrderLogs: [],
    workers: [],
};

export const dataReducer = (state = rootState, action) => {
    switch (action.type) {
        case SET_USER:
            return {
                ...state,
                user: action.payload
            };
        case SET_CUSTOMERS:
            return {
                ...state,
                customers: action.payload
            };
        case SET_INVENTORYITEMS:
            return {
                ...state,
                inventoryItems: action.payload
            };
        case SET_SERVICEITEMS:
            return {
                ...state,
                serviceItems: action.payload
            };
        case SET_SPENDINGS:
            return {
                ...state,
                spendings: action.payload
            };
        case SET_VEHICLES:
            return {
                ...state,
                vehicles: action.payload
            };
        case SET_WORKORDERASSIGNMENTS:
            return {
                ...state,
                workOrderAssignments: action.payload
            };
        case SET_WORKORDERS:
            return {
                ...state,
                workOrders: action.payload
            };
        case SET_WORKORDERLINEITEMS:
            return {
                ...state,
                workOrderLineItems: action.payload
            };
        case SET_WORKORDERLOGS:
            return {
                ...state,
                workOrderLogs: action.payload
            };
        case SET_WORKERS:
            return {
                ...state,
                workers: action.payload
            };
        default:
            return state;
    }
}