import BaseApiService from "../../../services/api/baseApiService";
import { API_ENDPOINTS } from "../../../services/api/config/apiConfig";

class ScheduleService extends BaseApiService {
  constructor() {
    super("schedules");
  }

  async getAll(params = {}) {
    try {
      const response = await super.getAll(params);

      let schedules = [];
      let paginationData = {
        total: 0,
        perPage: params.per_page || 15,
        currentPage: 1,
        totalPages: 1,
        from: null,
        to: null,
      };

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          schedules = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          schedules = response.data.data;
        }
      } else if (response && Array.isArray(response)) {
        schedules = response;
      }

      if (response?.meta) {
        paginationData = {
          total: response.meta.total || 0,
          perPage: response.meta.per_page || params.per_page || 15,
          currentPage: response.meta.current_page || 1,
          totalPages: response.meta.last_page || 1,
          from: response.meta.from || null,
          to: response.meta.to || null,
        };
      } else if (response?.data?.meta) {
        paginationData = {
          total: response.data.meta.total || 0,
          perPage: response.data.meta.per_page || params.per_page || 15,
          currentPage: response.data.meta.current_page || 1,
          totalPages: response.data.meta.last_page || 1,
          from: response.data.meta.from || null,
          to: response.data.meta.to || null,
        };
      }

      return {
        data: schedules,
        pagination: paginationData,
      };
    } catch (error) {
      console.error("Error in ScheduleService.getAll:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await super.getById(id);
      return response?.data || response;
    } catch (error) {
      console.error(`Error fetching schedule ${id}:`, error);
      throw error;
    }
  }

  async create(data) {
    try {
      const response = await super.create(data);
      return response?.data || response;
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await super.update(id, data);
      return response?.data || response;
    } catch (error) {
      console.error(`Error updating schedule ${id}:`, error);
      throw error;
    }
  }

  async deleteSchedule(id) {
    try {
      const response = await super.delete(id);
      return response;
    } catch (error) {
      console.error(`Error deleting schedule ${id}:`, error);
      throw error;
    }
  }
}

const scheduleService = new ScheduleService();
export default scheduleService;
