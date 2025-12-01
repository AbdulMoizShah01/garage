import { useDispatch, useSelector } from 'react-redux';
import {
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    fetchCustomers,
    createCustomer,
    updateInventoryItem,
    fetchInventoryItems
} from '../redux/actions';
import { useEffect } from 'react';

const useWorkOrders = () => {
    const dispatch = useDispatch();
    const workOrders = useSelector(state => state.workOrders);
    const customers = useSelector(state => state.customers);
    const inventoryItems = useSelector(state => state.inventoryItems);

    useEffect(() => {
        // Initial fetch if needed, though pages usually trigger this.
        // We can keep it here to ensure data is always available when using the hook.
        if (workOrders.length === 0) dispatch(fetchWorkOrders());
        if (customers.length === 0) dispatch(fetchCustomers());
        if (inventoryItems.length === 0) dispatch(fetchInventoryItems());
    }, [dispatch, workOrders.length, customers.length, inventoryItems.length]);

    const getWorkOrders = () => {
        dispatch(fetchWorkOrders());
    };

    const addWorkOrder = async (workOrderData) => {
        // 1. Create Customer
        const newCustomer = {
            name: workOrderData.customer.name,
            phone: workOrderData.customer.phone,
            vehicle: workOrderData.vehicle,
            createdAt: new Date().toISOString()
        };
        const customerId = await dispatch(createCustomer(newCustomer));

        // 2. Create Work Order
        // Calculate costs from services
        const services = workOrderData.services || [];
        const partsCost = services.filter(s => s.type === 'Part').reduce((acc, s) => acc + (Number(s.unitPrice) * Number(s.quantity)), 0);
        const labourCost = services.filter(s => s.type === 'Service').reduce((acc, s) => acc + (Number(s.unitPrice) * Number(s.quantity)), 0);
        const parking = Number(workOrderData.financials.parking) || 0;
        const taxes = Number(workOrderData.financials.taxes) || 0;
        const discount = Number(workOrderData.financials.discount) || 0;

        const flatWorkOrder = {
            arrival: workOrderData.job.arrival,
            completedDate: null,
            createdAt: new Date().toISOString(),
            customerId: customerId,
            description: workOrderData.job.description,
            discount: discount,
            isHistorical: false,
            labourCost: labourCost,
            notes: workOrderData.vehicle.notes,
            parkingCharge: parking,
            partsCost: partsCost,
            quotedAt: new Date().toISOString(),
            status: 'Pending',
            taxes: taxes,
            _tempVehicle: workOrderData.vehicle,
            lineItems: services,
            totalAmount: labourCost + partsCost + parking + taxes - discount,
            workerId: workOrderData.job.worker
        };

        return await dispatch(createWorkOrder(flatWorkOrder));
    };

    const editWorkOrder = async (id, updates) => {
        await dispatch(updateWorkOrder(id, updates));
    };

    const markWorkOrderComplete = async (id) => {
        const workOrder = workOrders.find(wo => wo.id === id);
        if (!workOrder || workOrder.status === 'Completed') return;

        // Deduct inventory
        if (workOrder.lineItems) {
            for (const item of workOrder.lineItems) {
                if (item.type === 'Part' && item.catalog && item.catalog !== 'Optional') {
                    const inventoryItem = inventoryItems.find(i => i.id === item.catalog);
                    if (inventoryItem) {
                        const newQuantity = Math.max(0, (Number(inventoryItem.quantityOnHand) || 0) - (Number(item.quantity) || 0));
                        await dispatch(updateInventoryItem(inventoryItem.id, { quantityOnHand: newQuantity }));
                    }
                }
            }
        }

        await dispatch(updateWorkOrder(id, { status: 'Completed', completedDate: new Date().toISOString() }));
    };

    const removeWorkOrder = async (id) => {
        await dispatch(deleteWorkOrder(id));
    };

    const printQuotation = (workOrder) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Quotation - ${workOrder.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        .header { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                        .details { margin-bottom: 20px; }
                        .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Work Order Quotation</h1>
                        <p>ID: ${workOrder.id}</p>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="details">
                        <p><strong>Description:</strong> ${workOrder.description}</p>
                        <p><strong>Status:</strong> ${workOrder.status}</p>
                        <p><strong>Arrival:</strong> ${new Date(workOrder.arrival).toLocaleString()}</p>
                    </div>
                    <div class="total">
                        Total: RF ${calculateTotal(workOrder).toFixed(2)}
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const calculateTotal = (wo) => {
        const labour = Number(wo.labourCost) || 0;
        const parts = Number(wo.partsCost) || 0;
        const parking = Number(wo.parkingCharge) || 0;
        const taxes = Number(wo.taxes) || 0;
        const discount = Number(wo.discount) || 0;
        return labour + parts + parking + taxes - discount;
    };

    const getCustomerName = (customerId, wo) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : (wo._tempCustomerName || 'Unknown Customer');
    };

    return {
        workOrders,
        customers,
        getWorkOrders,
        addWorkOrder,
        editWorkOrder,
        markWorkOrderComplete,
        removeWorkOrder,
        removeWorkOrder,
        printQuotation,
        calculateTotal,
        getCustomerName
    };
};

export default useWorkOrders;
