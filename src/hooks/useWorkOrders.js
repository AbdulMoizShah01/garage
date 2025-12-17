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
        const vat = Number(workOrderData.financials.vat) || 0;
        const discount = Number(workOrderData.financials.discount) || 0;
        const amountReceived = Number(workOrderData.financials.amountReceived) || 0;

        const totalAmount = labourCost + partsCost + parking + taxes + vat - discount;
        const outstandingBalance = Math.max(0, totalAmount - amountReceived);

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
            vat: vat,
            _tempVehicle: workOrderData.vehicle,
            _tempCustomerName: workOrderData.customer.name,
            _tempCustomerPhone: workOrderData.customer.phone,
            lineItems: services,
            totalAmount: totalAmount,
            amountReceived: amountReceived,
            outstandingBalance: outstandingBalance,
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
        const customer = customers.find(c => c.id === workOrder.customerId);
        const customerName = customer ? customer.name : (workOrder._tempCustomerName || 'N/A');
        const customerPhone = customer ? customer.phone : (workOrder._tempCustomerPhone || 'N/A');
        const vehicle = workOrder._tempVehicle || customer?.vehicle || {};

        // Generate reference number
        const refDate = new Date(workOrder.createdAt || new Date());
        const refNumber = `QT/TAG/KGL/${refDate.getFullYear().toString().slice(-2)}-${workOrder.id.slice(0, 5).toUpperCase()}`;
        const displayDate = refDate.toLocaleDateString('en-GB');

        // Calculate totals
        const lineItems = workOrder.lineItems || [];
        const subtotal = lineItems.reduce((acc, item) => acc + (Number(item.unitPrice) * Number(item.quantity)), 0);
        const parkingCharge = Number(workOrder.parkingCharge) || 0;
        const amount = subtotal + parkingCharge;
        const vatAmount = Number(workOrder.vat) || 0;
        const discount = Number(workOrder.discount) || 0;
        const discountPercent = amount > 0 ? ((discount / amount) * 100).toFixed(0) : 0;
        const totalAmount = amount + vatAmount - discount;

        // Generate line items rows
        const generateLineItemsRows = () => {
            let rows = '';
            lineItems.forEach((item, index) => {
                const bgColor = index % 2 === 0 ? '#e6f3ff' : '#ffffff';
                const total = Number(item.unitPrice) * Number(item.quantity);
                rows += `
                    <tr style="background-color: ${bgColor};">
                        <td style="border: 1px solid #ccc; padding: 8px 12px; text-align: left;">${item.name || item.description || 'Item'}</td>
                        <td style="border: 1px solid #ccc; padding: 8px 12px; text-align: center;">${item.quantity || 1}</td>
                        <td style="border: 1px solid #ccc; padding: 8px 12px; text-align: center;">${Number(item.unitPrice).toLocaleString()}</td>
                        <td style="border: 1px solid #ccc; padding: 8px 12px; text-align: right;">${total.toLocaleString()}</td>
                    </tr>
                `;
            });
            return rows;
        };

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - ${refNumber}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body { 
                            font-family: 'Inter', Arial, sans-serif; 
                            padding: 30px 40px;
                            color: #333;
                            font-size: 12px;
                            line-height: 1.4;
                        }
                        
                        .logo-header {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        
                        .logo-header img {
                            max-height: 80px;
                        }
                        
                        .invoice-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: #333;
                            margin-bottom: 15px;
                        }
                        
                        .date-ref {
                            text-align: right;
                            margin-bottom: 20px;
                        }
                        
                        .date-ref p {
                            margin-bottom: 5px;
                            font-size: 12px;
                        }
                        
                        .date-ref .ref-number {
                            color: #0066cc;
                            font-weight: 600;
                        }
                        
                        .customer-info {
                            margin-bottom: 15px;
                        }
                        
                        .customer-info p {
                            margin-bottom: 3px;
                        }
                        
                        .vehicle-section h4 {
                            font-size: 11px;
                            font-weight: 600;
                            margin-bottom: 8px;
                        }
                        
                        .vehicle-table {
                            border-collapse: collapse;
                            margin-bottom: 25px;
                            width: auto;
                        }
                        
                        .vehicle-table td {
                            border: 1px solid #333;
                            padding: 6px 12px;
                            font-size: 11px;
                        }
                        
                        .vehicle-table td:first-child {
                            font-weight: 600;
                            background-color: #f5f5f5;
                            width: 80px;
                        }
                        
                        .items-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 15px;
                        }
                        
                        .items-table th {
                            background-color: #003366;
                            color: white;
                            padding: 10px 12px;
                            text-align: center;
                            font-weight: 600;
                            font-size: 11px;
                            border: 1px solid #003366;
                        }
                        
                        .items-table th:first-child {
                            text-align: left;
                        }
                        
                        .items-table th:last-child {
                            text-align: right;
                        }
                        
                        .summary-section {
                            margin-top: 10px;
                            margin-bottom: 30px;
                        }
                        
                        .summary-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 5px 0;
                            border-bottom: 1px solid #eee;
                        }
                        
                        .summary-row.total {
                            font-weight: 700;
                            font-size: 13px;
                            border-bottom: 2px solid #333;
                            margin-top: 5px;
                        }
                        
                        .summary-label {
                            font-weight: 600;
                        }
                        
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                        }
                        
                        .footer-prepared {
                            font-size: 11px;
                            margin-bottom: 15px;
                        }
                        
                        .footer-prepared span {
                            font-weight: 700;
                        }
                        
                        .footer-logo {
                            margin-bottom: 15px;
                        }
                        
                        .footer-logo img {
                            max-height: 60px;
                        }
                        
                        .footer-contact {
                            text-align: right;
                            font-size: 10px;
                            line-height: 1.6;
                        }
                        
                        .footer-contact p {
                            margin: 0;
                        }
                        
                        .footer-contact .highlight {
                            font-weight: 600;
                        }
                        
                        .footer-wrapper {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                        }
                        
                        @media print {
                            body {
                                padding: 20px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <!-- Logo Header -->
                    <div class="logo-header">
                        <img src="/full-logo.png" alt="T-HE AUTO GARAGE" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div style="display: none; font-size: 28px; font-weight: 700; color: #0066cc;">
                            <span style="color: #cc0000;">T-HE</span> AUTO <span style="color: #0066cc;">GARAGE</span>
                        </div>
                    </div>
                    
                    <!-- Invoice Title and Date/Ref -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <div class="invoice-title">INVOICE:</div>
                        <div class="date-ref">
                            <p><strong>Date: ${displayDate}</strong></p>
                            <p class="ref-number">Ref: ${refNumber}</p>
                        </div>
                    </div>
                    
                    <!-- Customer Info -->
                    <div class="customer-info">
                        <p><strong>Name:</strong> ${customerName}</p>
                        <p><strong>Contact:</strong> ${customerPhone}</p>
                    </div>
                    
                    <!-- Vehicle Details -->
                    <div class="vehicle-section">
                        <h4>Vehicle Details:</h4>
                        <table class="vehicle-table">
                            <tr>
                                <td>Make</td>
                                <td>${vehicle.make || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Model</td>
                                <td>${vehicle.model || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Year</td>
                                <td>${vehicle.year || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td>Plate no</td>
                                <td>${vehicle.plate || 'N/A'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Items Table -->
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th style="text-align: left;">Description</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th style="text-align: right;">Total amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateLineItemsRows()}
                        </tbody>
                    </table>
                    
                    <!-- Summary Section -->
                    <div class="summary-section">
                        <div class="summary-row">
                            <span class="summary-label">Amount</span>
                            <span>${amount.toLocaleString()}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">VAT 18%</span>
                            <span>${vatAmount.toLocaleString()}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Discount ${discountPercent}%</span>
                            <span>${discount.toLocaleString()}</span>
                        </div>
                        <div class="summary-row total">
                            <span class="summary-label">Total Amount</span>
                            <span>${totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <p class="footer-prepared">Prepared by <span>T-HE AUTO GARAGE</span></p>
                        
                        <div class="footer-wrapper">
                            <div class="footer-logo">
                                <img src="/full-logo.png" alt="TAG" onerror="this.style.display='none';">
                            </div>
                            <div class="footer-contact">
                                <p><span class="highlight">Momo code: 48006</span></p>
                                <p>Tin: 122972619</p>
                                <p>Tell: +250795048006</p>
                                <p>AC# 100189078317</p>
                                <p class="highlight">T-HE AUTO GARAGE</p>
                                <p>BANK OF KIGALI</p>
                                <p><strong>Address:</strong> House# 132 KG-6, Near</p>
                                <p>Four Square Church, Kimironko, Kigali</p>
                            </div>
                        </div>
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
        const vat = Number(wo.vat) || 0;
        const discount = Number(wo.discount) || 0;
        return labour + parts + parking + taxes + vat - discount;
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
        printQuotation,
        calculateTotal,
        getCustomerName
    };
};

export default useWorkOrders;
