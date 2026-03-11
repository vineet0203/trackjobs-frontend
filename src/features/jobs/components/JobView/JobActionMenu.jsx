// src/pages/Jobs/components/JobView/JobActionMenu.jsx
import React, { useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Chip
} from '@mui/material';
import {
    MoreVert,
    Edit,
    Delete,
    Print,
    Share,
    CheckCircle,
    Schedule,
    PlayArrow,
    Pause,
    Cancel,
    Archive,
    Update
} from '@mui/icons-material';
import StatusChip from '../../../../components/common/chips/StatusChip';

const statusOptions = [
    { value: 'pending', label: 'Pending', icon: <Schedule fontSize="small" />, color: 'warning' },
    { value: 'scheduled', label: 'Scheduled', icon: <Schedule fontSize="small" />, color: 'info' },
    { value: 'in_progress', label: 'In Progress', icon: <PlayArrow fontSize="small" />, color: 'primary' },
    { value: 'on_hold', label: 'On Hold', icon: <Pause fontSize="small" />, color: 'default' },
    { value: 'completed', label: 'Completed', icon: <CheckCircle fontSize="small" />, color: 'success' },
    { value: 'cancelled', label: 'Cancelled', icon: <Cancel fontSize="small" />, color: 'error' },
    { value: 'archived', label: 'Archived', icon: <Archive fontSize="small" />, color: 'default' },
];

const JobActionMenu = ({ status, onEdit, onDelete, onPrint, onShare, onStatusChange }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [statusAnchorEl, setStatusAnchorEl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleStatusMenuOpen = (event) => {
        setStatusAnchorEl(event.currentTarget);
        handleMenuClose();
    };
    const handleStatusMenuClose = () => setStatusAnchorEl(null);

    const handleStatusChange = (newStatus) => {
        onStatusChange(newStatus);
        handleStatusMenuClose();
    };

    const handleEdit = () => {
        handleMenuClose();
        onEdit();
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        onDelete();
        setDeleteDialogOpen(false);
    };

    const handlePrint = () => {
        handleMenuClose();
        onPrint();
    };

    const handleShare = () => {
        handleMenuClose();
        onShare();
    };

    const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

    return (
        <>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <IconButton onClick={handleMenuOpen}>
                    <MoreVert />
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handlePrint}>
                        <ListItemIcon><Print fontSize="small" /></ListItemIcon>
                        <ListItemText>Print</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleShare}>
                        <ListItemIcon><Share fontSize="small" /></ListItemIcon>
                        <ListItemText>Share</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                        <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>

                <Menu
                    anchorEl={statusAnchorEl}
                    open={Boolean(statusAnchorEl)}
                    onClose={handleStatusMenuClose}
                >
                    {statusOptions.map((option) => (
                        <MenuItem
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            selected={status === option.value}
                            disabled={status === option.value}
                        >
                            <ListItemIcon sx={{ color: `${option.color}.main` }}>
                                {option.icon}
                            </ListItemIcon>
                            <ListItemText>{option.label}</ListItemText>
                            {status === option.value && (
                                <Chip size="small" label="Current" sx={{ ml: 2 }} />
                            )}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Job</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this job? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default JobActionMenu;