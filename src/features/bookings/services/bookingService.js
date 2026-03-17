import httpClient from '../../../services/api/httpClient';

const BOOKING_BASE_PATH = '/api/v1/online-booking';

const unwrapList = (response) => response?.data?.data ?? [];

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
    return unwrapList(response);
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