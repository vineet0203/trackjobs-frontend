import httpClient from '../../../services/api/httpClient';

const BOOKING_BASE_PATH = '/api/v1/online-booking';

const unwrapList = (response) => response?.data?.data ?? [];

const normalizeEmployees = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((employee) => {
    const firstName = employee?.first_name || employee?.firstName || '';
    const lastName = employee?.last_name || employee?.lastName || '';
    const fallbackName = `${firstName} ${lastName}`.trim();

    return {
      id: employee?.id,
      name: employee?.name || fallbackName || employee?.designation || 'Unnamed Provider',
      designation: employee?.designation || '',
      is_active: employee?.is_active,
    };
  });
};

const bookingService = {
  async getCategories() {
    const response = await httpClient.get(`${BOOKING_BASE_PATH}/categories`);
    return unwrapList(response);
  },

  async getCustomers(category) {
    const response = await httpClient.get(`${BOOKING_BASE_PATH}/customers`, {
      params: { category },
    });

    return unwrapList(response);
  },

  async getEmployees() {
    const response = await httpClient.get(`${BOOKING_BASE_PATH}/employees`);
    const list = unwrapList(response);
    const providers = normalizeEmployees(list);

    console.log('providers:', providers);

    return providers;
  },

  async getLocations(customerId) {
    const response = await httpClient.get(`${BOOKING_BASE_PATH}/locations`, {
      params: { customerId },
    });

    return unwrapList(response);
  },

  async createBooking(payload) {
    const response = await httpClient.post('/api/v1/bookings', payload);
    return response?.data?.data ?? null;
  },
};

export default bookingService;