// features/quotes/components/QuoteForm/QuoteLineItems.jsx
import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    Button,
    IconButton,
    Alert,
    Grid
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import DebouncedTextField from '../../../../components/common/form/DebouncedTextField';
import SectionHeader from '../../../../components/common/form/SectionHeader';

const QuoteLineItems = ({ formik, defaultTaxRate = 0 }) => {
    const { values, setFieldValue, errors, touched, setFieldTouched } = formik;
    const [localValues, setLocalValues] = useState({});

    const handleAddLineItem = () => {
        const newItem = {
            item_name: '',
            description: '',
            quantity: 1,
            unit_price: 1,
            tax_rate: defaultTaxRate,
            package_id: null,
        };
        const newItems = [...values.line_items, newItem];
        setFieldValue('line_items', newItems);

        // Mark new fields as touched to show validation
        setTimeout(() => {
            setFieldTouched(`line_items[${newItems.length - 1}].item_name`, true, false);
            setFieldTouched(`line_items[${newItems.length - 1}].quantity`, true, false);
            setFieldTouched(`line_items[${newItems.length - 1}].unit_price`, true, false);
        }, 100);
    };

    const handleRemoveLineItem = (index) => {
        const updatedItems = values.line_items.filter((_, i) => i !== index);
        setFieldValue('line_items', updatedItems);
    };

    const handleNumberKeyDown = (e) => {
        // Prevent entering negative sign
        if (e.key === '-' || e.key === 'e') {
            e.preventDefault();
        }
    };

    const handleNumberBlur = (index, field, currentValue) => {
        // Ensure minimum value on blur
        let finalValue = currentValue;

        if (field === 'quantity') {
            if (currentValue === '' || currentValue === null || currentValue < 1) {
                finalValue = 1;
            }
        } else if (field === 'unit_price') {
            if (currentValue === '' || currentValue === null || currentValue < 0) {
                finalValue = 0;
            }
        } else if (field === 'tax_rate') {
            if (currentValue === '' || currentValue === null || currentValue < 0) {
                finalValue = 0;
            } else if (currentValue > 100) {
                finalValue = 100;
            }
        }

        // Update if value changed
        if (finalValue !== currentValue) {
            const updatedItems = [...values.line_items];
            updatedItems[index][field] = finalValue;
            setFieldValue('line_items', updatedItems);
        }

        setFieldTouched(`line_items[${index}].${field}`, true, false);
    };

const handleItemChange = (index, field, value) => {
    const updatedItems = [...values.line_items];

    if (field === 'item_name' || field === 'description') {
        // String fields - always store as string
        updatedItems[index][field] = value || '';
    } else {
        // For number fields, allow empty string temporarily
        if (value === '') {
            updatedItems[index][field] = '';
        } else {
            let numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                updatedItems[index][field] = numValue;
            }
        }
    }

    setFieldValue('line_items', updatedItems);
    // Don't mark as touched here, let blur handle it
};

    const calculateItemTotal = (item) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
        const unitPrice = typeof item.unit_price === 'number' ? item.unit_price : 0;
        const taxRate = typeof item.tax_rate === 'number' ? item.tax_rate : 0;

        const subtotal = quantity * unitPrice;
        const taxAmount = subtotal * (taxRate / 100);
        return subtotal + taxAmount;
    };

    const calculateSubtotal = () => {
        return values.line_items.reduce((sum, item) => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
            const unitPrice = typeof item.unit_price === 'number' ? item.unit_price : 0;
            return sum + (quantity * unitPrice);
        }, 0);
    };

    const calculateTotal = () => {
        return values.line_items.reduce((sum, item) => {
            return sum + calculateItemTotal(item);
        }, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: values.currency || 'USD',
        }).format(amount);
    };

    // Helper to get nested error
    const getItemError = (index, field) => {
        return errors.line_items?.[index]?.[field] &&
            touched.line_items?.[index]?.[field]
            ? errors.line_items[index][field]
            : null;
    };

    // Check if all items are valid
    const allItemsValid = values.line_items.every(item =>
        item.item_name &&
        item.item_name.trim().length > 0 &&
        typeof item.quantity === 'number' && item.quantity > 0 &&
        typeof item.unit_price === 'number' && item.unit_price > 0
    );

    // Get line items array error
    const lineItemsError = typeof errors.line_items === 'string' ? errors.line_items : null;

    // Mark fields as touched on mount
    useEffect(() => {
        values.line_items.forEach((_, index) => {
            setFieldTouched(`line_items[${index}].item_name`, true, false);
            setFieldTouched(`line_items[${index}].quantity`, true, false);
            setFieldTouched(`line_items[${index}].unit_price`, true, false);
        });
    }, []);

    return (
        <Box sx={{ mt: 3 }}>
            <SectionHeader
                number="2"
                title="Line Items & Packages"
            />

            <Typography variant="subtitle1" gutterBottom sx={{ color: '#666', mb: 2 }}>
                Add in Items/Packages <span style={{ color: '#d32f2f' }}>*</span>
            </Typography>

            {/* Line Items Container */}
            <Paper
                variant="outlined"
                sx={{
                    mb: 3,
                    p: 2,
                    borderColor: (!allItemsValid && errors.line_items) ? '#d32f2f' : '#e0e0e0'
                }}
            >
                {values.line_items.map((item, index) => (
                    <Box key={index} sx={{ mb: index < values.line_items.length - 1 ? 3 : 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Item #{index + 1}
                            </Typography>
                            <IconButton
                                onClick={() => handleRemoveLineItem(index)}
                                size="small"
                                disabled={values.line_items.length <= 1}
                                sx={{ ml: 1 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Grid container spacing={1}>
                            {/* Item Name - Required */}
                            <Grid item xs={12} md={3}>
                                <DebouncedTextField
                                    name={`line_items[${index}].item_name`}
                                    label="Item Name"
                                    value={item.item_name || ''}
                                    onChange={(value) => handleItemChange(index, 'item_name', value)}
                                    onBlur={() => setFieldTouched(`line_items[${index}].item_name`, true)}
                                    placeholder="Enter item name"
                                    size="small"
                                    fullWidth
                                    required
                                    error={getItemError(index, 'item_name')}
                                    helperText={getItemError(index, 'item_name')}
                                />
                            </Grid>

                            {/* Description - Optional */}
                            <Grid item xs={12} md={3}>
                                <DebouncedTextField
                                    name={`line_items[${index}].description`}
                                    label="Description"
                                    value={item.description || ''}
                                    onChange={(value) => handleItemChange(index, 'description', value)}
                                    onBlur={() => setFieldTouched(`line_items[${index}].description`, true)}
                                    placeholder="Optional description"
                                    size="small"
                                    fullWidth
                                />
                            </Grid>

                            {/* Quantity - Required */}
                            <Grid item xs={6} md={1.8}>
                                <DebouncedTextField
                                    name={`line_items[${index}].quantity`}
                                    label="Qty"
                                    type="number"
                                    value={item.quantity}
                                    onChange={(value) => handleItemChange(index, 'quantity', value)}
                                    onBlur={() => handleNumberBlur(index, 'quantity', item.quantity)}
                                    onKeyDown={handleNumberKeyDown}
                                    size="small"
                                    fullWidth
                                    required
                                    error={getItemError(index, 'quantity')}
                                    helperText={getItemError(index, 'quantity')}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                        pattern: "[0-9]*"
                                    }}
                                />
                            </Grid>

                            {/* Unit Price - Required */}
                            {/* Unit Price - Required */}
                            <Grid item xs={6} md={2.2}>
                                <DebouncedTextField
                                    name={`line_items[${index}].unit_price`}
                                    label="Unit Price"
                                    type="number"
                                    value={item.unit_price}
                                    onChange={(value) => handleItemChange(index, 'unit_price', value)}
                                    onBlur={() => handleNumberBlur(index, 'unit_price', item.unit_price)}
                                    onKeyDown={handleNumberKeyDown}
                                    size="small"
                                    fullWidth
                                    required
                                    error={getItemError(index, 'unit_price')}
                                    helperText={getItemError(index, 'unit_price')}
                                    InputProps={{
                                        startAdornment: (
                                            <span style={{ marginRight: 4 }}>
                                                {values.currency === 'USD' ? '$' :
                                                values.currency === 'EUR' ? '€' :
                                                values.currency === 'GBP' ? '£' :
                                                values.currency === 'JPY' ? '¥' :
                                                values.currency === 'CAD' ? 'C$' :
                                                values.currency === 'AUD' ? 'A$' : '$'}
                                            </span>
                                        ),
                                    }}
                                    inputProps={{
                                        min: 0,
                                        step: 0.01,
                                        pattern: "[0-9]*\\.?[0-9]*"
                                    }}
                                />
                            </Grid>

                            {/* Tax Rate - Optional */}
                            <Grid item xs={6} md={2}>
                                <DebouncedTextField
                                    name={`line_items[${index}].tax_rate`}
                                    label="Tax"
                                    type="number"
                                    value={item.tax_rate}
                                    onChange={(value) => handleItemChange(index, 'tax_rate', value)}
                                    onBlur={() => handleNumberBlur(index, 'tax_rate', item.tax_rate)}
                                    onKeyDown={handleNumberKeyDown}
                                    size="small"
                                    fullWidth
                                    error={getItemError(index, 'tax_rate')}
                                    helperText={getItemError(index, 'tax_rate')}
                                    InputProps={{
                                        endAdornment: <span style={{ marginLeft: 4 }}>%</span>,
                                    }}
                                    inputProps={{
                                        min: 0,
                                        max: 100,
                                        step: 0.1,
                                        pattern: "[0-9]*\\.?[0-9]*"
                                    }}
                                />
                            </Grid>

                            {/* Item Total - Display Only */}
                            <Grid item xs={12} md={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pl: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {formatCurrency(calculateItemTotal(item))}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                ))}

                {/* Add Item Button */}
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddLineItem}
                        size="small"
                    >
                        Add Another Item
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default QuoteLineItems;