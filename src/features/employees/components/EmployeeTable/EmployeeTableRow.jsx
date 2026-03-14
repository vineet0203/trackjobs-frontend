import React from "react";
import {
    TableRow,
    TableCell,
    Checkbox,
    Box,
    Chip,
    IconButton,
} from "@mui/material";
import ProfileAvatar from "../../../../components/common/avatar/ProfileAvatar";
import EllipsisText from "../../../../components/common/EllipsisText";
import { PenIcon, Trash2 } from "lucide-react";
import { DESIGNATION_VALUE_TO_LABEL } from "../../constants/employeeConstants";

const EmployeeTableRow = ({
    employee,
    isSelected,
    onSelect,
    onEdit,
    onDelete
}) => {

    const handleEditClick = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        if (onEdit) {
            onEdit(employee.id);
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        if (onDelete) {
            onDelete(employee.id);
        }
    };

    return (
        <TableRow
            hover
            selected={isSelected}
            sx={{
                height: 73,
                "& .MuiTableCell-root": {
                    py: 2,
                },
                '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.02)',
                },
                '& .MuiTableCell-root:first-of-type': {
                    pl: '16px',
                    pr: '8px',
                },
                '& .MuiTableCell-root:last-of-type': {
                    pr: '16px',
                }
            }}
        >
            {/* Checkbox */}
            <TableCell padding="checkbox">
                <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={() => onSelect(employee.id)}
                    sx={{
                        p: '4px',
                    }}
                />
            </TableCell>

            {/* Employee ID */}
            <TableCell>
                <EllipsisText
                    text={employee.employee_id}
                    sx={{ maxWidth: 100, fontWeight: 500, fontSize: '0.875rem' }}
                />
            </TableCell>

            {/* Employee Name + Avatar */}
            <TableCell>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                    }}
                >
                    <ProfileAvatar
                        name={employee.full_name}
                        size={32}
                        showName={false}
                    />

                    <EllipsisText
                        text={employee.full_name}
                        sx={{
                            fontWeight: 500,
                            maxWidth: 100,
                            fontSize: '0.875rem',
                        }}
                    />
                </Box>
            </TableCell>

            {/* Designation */}
            <TableCell>
                <EllipsisText
                    text={DESIGNATION_VALUE_TO_LABEL[employee.designation] || employee.designation || "N/A"}
                    sx={{ maxWidth: 100, fontSize: '0.875rem' }}
                />
            </TableCell>

            {/* Email */}
            <TableCell>
                <EllipsisText
                    text={employee.email}
                    sx={{ maxWidth: 180, fontSize: '0.875rem' }}
                />
            </TableCell>

            {/* Phone */}
            <TableCell>
                <EllipsisText
                    text={employee.mobile_number}
                    sx={{ maxWidth: 130, fontSize: '0.875rem' }}
                />
            </TableCell>

            {/* Status */}
            <TableCell>
                <Chip
                    label={employee.is_active ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                        bgcolor: employee.is_active ? "#35a370" : "#d32f2f",
                        color: "#ffffff",
                        borderRadius: '12px',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: 20,
                        '& .MuiChip-label': {
                            fontSize: '0.75rem',
                            px: 1,
                            lineHeight: 1,
                        }
                    }}
                />
            </TableCell>

            {/* Actions */}
            <TableCell align="center">
                <Box sx={{ display: "flex", justifyContent: "center", gap: 0 }}>
                    <IconButton
                        size="small"
                        onClick={handleEditClick} // ✅ Use the handler
                        sx={{ p: '4px' }}
                    >
                        <PenIcon style={{ width: 16, height: 16 }} />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={handleDeleteClick} // ✅ Use the handler
                        sx={{
                            p: '4px',
                            '&:hover': {
                                color: '#d32f2f'
                            }
                        }}
                    >
                        <Trash2 style={{ width: 16, height: 16 }} />
                    </IconButton>
                </Box>
            </TableCell>
        </TableRow>
    );
};

export default EmployeeTableRow;