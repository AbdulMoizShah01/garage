import { Component } from "react";
import Dashboard from "./pages/Dashboard";
import MetaData from "./pages/MetaData";
import WorkOrderPage from "./pages/WorkOrderPage";
import WorkOrderHistoryPage from './pages/WorkOrderHistoryPage';
import WorkersPage from './pages/WorkersPage';
import WorkerDetailsPage from './pages/WorkerDetailsPage';
import InventoryPage from './pages/InventoryPage';
import ServicesPage from './pages/ServicesPage';
import SpendingsPage from './pages/SpendingsPage';
import InsightsPage from './pages/InsightsPage';

export const routes = {
    userRoutes: [
        { path: "/", Component: Dashboard },
        { path: "/metadata", Component: MetaData },
        { path: "/workorders", Component: WorkOrderPage },
        { path: "/workorderhistory", Component: WorkOrderHistoryPage },
        { path: "/workers", Component: WorkersPage },
        { path: "/workers/:workerId", Component: WorkerDetailsPage },
        { path: "/inventory", Component: InventoryPage },
        { path: "/services", Component: ServicesPage },
        { path: "/spendings", Component: SpendingsPage },
        { path: "/insights", Component: InsightsPage }

    ]
}
