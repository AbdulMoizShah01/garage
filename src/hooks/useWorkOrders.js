import { useDispatch, useSelector } from 'react-redux';
import {
    fetchWorkOrders,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    fetchCustomers,
    createCustomer
} from '../redux/actions';
import { useEffect } from 'react';

const useWorkOrders = () => {
    const dispatch = useDispatch();
    const workOrders = useSelector(state => state.workOrders);
    const customers = useSelector(state => state.customers);

    useEffect(() => {
        // Initial fetch if needed, though pages usually trigger this.
        // We can keep it here to ensure data is always available when using the hook.
        if (workOrders.length === 0) dispatch(fetchWorkOrders());
        if (customers.length === 0) dispatch(fetchCustomers());
    }, [dispatch, workOrders.length, customers.length]);

    const getWorkOrders = () => {
        dispatch(fetchWorkOrders());
    };

    const addWorkOrder = async (workOrderData) => {
        // 1. Create Customer
        const newCustomer = {
            name: workOrderData.customer.name,
            phone: workOrderData.customer.phone,
            createdAt: new Date().toISOString()
        };
        const customerId = await dispatch(createCustomer(newCustomer));

        // 2. Create Work Order
        const flatWorkOrder = {
            arrival: workOrderData.job.arrival,
            completedDate: null,
            createdAt: new Date().toISOString(),
            customerId: customerId,
            description: workOrderData.job.description,
            discount: Number(workOrderData.financials.discount),
            isHistorical: false,
            labourCost: 0,
            notes: workOrderData.vehicle.notes,
            parkingCharge: Number(workOrderData.financials.parking),
            partsCost: 0,
            quotedAt: new Date().toISOString(),
            status: 'Pending',
            taxes: Number(workOrderData.financials.taxes),
            _tempVehicle: workOrderData.vehicle
        };

        return await dispatch(createWorkOrder(flatWorkOrder));
    };

    const editWorkOrder = async (id, updates) => {
        await dispatch(updateWorkOrder(id, updates));
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
        removeWorkOrder,
        printQuotation,
        calculateTotal,
        getCustomerName
    };
};

export default useWorkOrders;
