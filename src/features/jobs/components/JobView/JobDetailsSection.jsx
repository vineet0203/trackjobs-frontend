// src/features/jobs/components/JobView/JobDetailsSection.jsx
import React, { useRef } from 'react';
import { Grid, Paper, Typography, Box, Chip, Button } from '@mui/material';
import { Business, Edit, Check, Schedule, Person, Description } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../../../components/common/form/SectionHeader';

const JobDetailsSection = ({ jobData, onUpdateJob }) => {
    const navigate = useNavigate();
    const endDateInputRef = useRef(null);

    // Safely access nested properties with fallbacks
    const clientName = jobData?.client?.name || 'N/A';
    const clientType = jobData?.client?.client_type || 'N/A';
    const clientCategory = jobData?.client?.category || 'N/A';

    // Format client type for display
    const formattedClientType = clientType === 'commercial' ? 'Commercial' :
        clientType === 'residential' ? 'Residential' : clientType;

    // Get quote number
    const quoteNumber = jobData?.quote?.quote_number || null;
    const quoteId = jobData?.quote?.id || jobData?.quote_id;

    // Format currency safely
    const totalAmount = jobData?.total_amount || 0;
    const formattedTotal = jobData?.currency
        ? `${jobData.currency} ${totalAmount.toFixed(2)}`
        : `$${totalAmount.toFixed(2)}`;

    // Helper to get client type chip color
    const getClientTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'commercial': return 'primary';
            case 'residential': return 'warning';
            default: return 'default';
        }
    };


    return (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            {/* Header with Title and Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <SectionHeader number="1" title="Job Details" />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Schedule />}
                        onClick={() => navigate(`/schedule?jobId=${jobData?.id}&openCreate=true`)}
                        sx={{
                            textTransform: 'none',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                        }}
                    >
                        Schedule
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={1}>
                {/* Client - Full Width with Type and Category Chips */}
                <Grid item xs={12}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                        mb: 0.5
                    }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Client:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight={500}>{clientName}</Typography>
                        </Box>
                        <Chip
                            label={formattedClientType}
                            size="small"
                            color={getClientTypeColor(clientType)}
                            variant="outlined"
                            sx={{
                                height: 20,
                                '& .MuiChip-label': {
                                    fontSize: '0.65rem',
                                    px: 0.8,
                                    fontWeight: 500,
                                },
                            }}
                        />
                    </Box>
                </Grid>

                {/* Row 1 */}
                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        height: '26px',
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Job ID:
                            </Typography>
                            <Typography variant="body1">{jobData?.job_number || 'N/A'}</Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        height: '26px',
                        alignItems: 'center'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '200px',
                            justifyContent: 'flex-start'
                        }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Issue Date:
                            </Typography>
                            <Typography variant="body1">{jobData?.issue_date || 'N/A'}</Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        height: '26px',
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Amount:
                            </Typography>
                            <Typography variant="h6" fontWeight={600} color="text.secondary">
                                {formattedTotal}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                {/* Row 2 */}
                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        height: '26px',
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Job Type:
                            </Typography>
                            <Typography variant="body1">
                                {jobData?.work_type
                                    ? jobData.work_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                                    : 'N/A'}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        height: '26px',
                        alignItems: 'center'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '200px',
                            justifyContent: 'flex-start'
                        }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Start Date:
                            </Typography>
                            <Typography variant="body1">{jobData?.start_date || 'N/A'}</Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        height: '26px',
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                End Date:
                            </Typography>
                            <Typography
                                variant="body1"
                                onClick={() => endDateInputRef.current?.showPicker()}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                                }}
                            >
                                {jobData?.end_date || 'N/A'}
                            </Typography>
                            <input
                                ref={endDateInputRef}
                                type="date"
                                style={{
                                    position: 'absolute',
                                    opacity: 0,
                                    width: 0,
                                    height: 0,
                                    pointerEvents: 'none',
                                }}
                                value={jobData?.end_date || ''}
                                onChange={(e) => {
                                    if (e.target.value && onUpdateJob) {
                                        onUpdateJob({ end_date: e.target.value });
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </Grid>

                {/* Row 3 - Priority and Dates */}
                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        height: '26px',
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Created from:
                            </Typography>
                            <Chip
                                icon={
                                    <Description
                                        sx={{
                                            fontSize: 16,
                                        }}
                                    />
                                }
                                label={`Quote #${quoteNumber}`}
                                size="small"
                                onClick={() => navigate(`/quotes/${quoteId}/edit`)}
                                sx={{
                                    cursor: 'pointer',
                                    px: 0.5,
                                    borderRadius: 2,
                                    bgcolor: 'primary.50',
                                    // color: 'primary.main',
                                    fontWeight: 600,
                                    transition: 'all 0.2s ease',

                                    '& .MuiChip-label': {
                                        fontSize: '0.75rem',
                                        px: 0.5,
                                        ml: 0.4
                                    },

                                    '& .MuiChip-icon': {
                                        color: 'primary.main',
                                        ml: 0.5,
                                        fontSize: 15
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        height: '26px',
                        alignItems: 'center'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '200px',
                            justifyContent: 'flex-start'
                        }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Est. Completion:
                            </Typography>
                            <Typography variant="body1">
                                {jobData?.estimated_completion_date || 'Not set'}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        height: '26px',
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Status:
                            </Typography>
                            <Chip
                                label={jobData?.status?.replace('_', ' ') || 'N/A'}
                                size="small"
                                // color={
                                //     jobData?.status === 'completed' ? 'success' :
                                //         jobData?.status === 'in_progress' ? 'info' :
                                //             jobData?.status === 'pending' ? 'secondary' :
                                //                 jobData?.status === 'cancelled' ? 'error' : 'default'
                                // }
                                sx={{
                                    height: 20,
                                    '& .MuiChip-label': {
                                        fontSize: '0.65rem',
                                        px: 0.8,
                                        fontWeight: 500,
                                        textTransform: 'capitalize',
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default JobDetailsSection;