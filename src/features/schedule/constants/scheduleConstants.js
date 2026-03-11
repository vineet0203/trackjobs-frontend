export const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "emergency", label: "Emergency" },
];

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const SHIFT_OPTIONS = [
  { value: "morning", label: "Morning (6AM - 12PM)" },
  { value: "afternoon", label: "Afternoon (12PM - 6PM)" },
  { value: "evening", label: "Evening (6PM - 12AM)" },
  { value: "night", label: "Night (12AM - 6AM)" },
];

export const PRIORITY_COLORS = {
  normal: { bg: "#E8F5E9", text: "#2E7D32" },
  high: { bg: "#FFF3E0", text: "#E65100" },
  emergency: { bg: "#FFEBEE", text: "#C62828" },
};

export const STATUS_COLORS = {
  draft: { bg: "#F5F5F5", text: "#757575" },
  scheduled: { bg: "#E3F2FD", text: "#1565C0" },
  completed: { bg: "#E8F5E9", text: "#2E7D32" },
  cancelled: { bg: "#FFEBEE", text: "#C62828" },
};

export const INITIAL_SCHEDULE_VALUES = {
  job_id: "",
  crew_id: "",
  start_date: "",
  start_time: "",
  end_date: "",
  end_time: "",
  priority: "normal",
  status: "scheduled",
  notes: "",
  is_multi_day: false,
  is_recurring: false,
  notify_client: false,
  notify_crew: false,
};
