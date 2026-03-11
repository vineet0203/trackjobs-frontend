import BaseApiService from "../../../services/api/baseApiService";
import {
  transformJobFromApi,
  transformJobForApi,
} from "../utils/jobTransformers";

class JobService extends BaseApiService {
  constructor() {
    super("jobs");
  }

  async getAll(params = {}) {
    try {
      console.log("JobService.getAll called with params:", params);
      const response = await super.getAll(params);
      console.log("Raw API response:", response);

      let jobs = [];
      let paginationData = {
        total: 0,
        perPage: params.per_page || 15, // Use the requested perPage as fallback
        currentPage: 1,
        totalPages: 1,
        from: null,
        to: null,
      };

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          jobs = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          jobs = response.data.data;
        }
      } else if (response && Array.isArray(response)) {
        jobs = response;
      }

      const transformedJobs = jobs.map(transformJobFromApi);

      if (response?.meta) {
        paginationData = {
          total: response.meta.total || 0,
          // Use API response if available, otherwise use the requested value
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

      console.log("Transformed jobs:", transformedJobs);
      console.log("Pagination data:", paginationData);

      return {
        data: transformedJobs,
        pagination: paginationData,
        links: response?.links || response?.data?.links || {},
      };
    } catch (error) {
      console.error("Error in JobService.getAll:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await super.getById(id);
      const jobData = response?.data || response;
      return transformJobFromApi(jobData);
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error;
    }
  }

  async create(data) {
    try {
      const apiData = transformJobForApi(data);
      const response = await super.create(apiData);
      const jobData = response?.data || response;
      return transformJobFromApi(jobData);
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const apiData = transformJobForApi(data);
      const response = await super.update(id, apiData);
      const jobData = response?.data || response;
      return transformJobFromApi(jobData);
    } catch (error) {
      console.error(`Error updating job ${id}:`, error);
      throw error;
    }
  }

  // Custom methods
  async updateJobStatus(id, status) {
    try {
      const url = this.buildUrl(`/jobs/${id}/status`);
      const response = await this.client.patch(url, { status });
      const jobData = response?.data?.data || response?.data || response;
      return transformJobFromApi(jobData);
    } catch (error) {
      console.error(`Error updating job status ${id}:`, error);
      throw error;
    }
  }

  async getJobByNumber(jobNumber) {
    try {
      const url = this.buildUrl(`/jobs/number/${jobNumber}`);
      const response = await this.client.get(url);
      const jobData = response?.data?.data || response?.data || response;
      return transformJobFromApi(jobData);
    } catch (error) {
      console.error(`Error fetching job by number ${jobNumber}:`, error);
      throw error;
    }
  }

  // Task management
  async addTask(jobId, taskData) {
    try {
      const url = this.buildUrl(`/jobs/${jobId}/tasks`);
      const response = await this.client.post(url, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error adding task to job ${jobId}:`, error);
      throw error;
    }
  }

  async toggleTask(jobId, taskId) {
    try {
      const url = this.buildUrl(`/jobs/${jobId}/tasks/${taskId}/toggle`);
      const response = await this.client.patch(url);
      return response.data;
    } catch (error) {
      console.error(`Error toggling task ${taskId} for job ${jobId}:`, error);
      throw error;
    }
  }

  async deleteTask(jobId, taskId) {
    try {
      const url = this.buildUrl(`/jobs/${jobId}/tasks/${taskId}`);
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error deleting task ${taskId} from job ${jobId}:`, error);
      throw error;
    }
  }

  // Attachment management
  async addAttachment(jobId, file, fileName, options = {}) {
    try {
      const url = this.buildUrl(`/jobs/${jobId}/attachments`);

      const formData = new FormData();
      formData.append("file", file);

      if (options.context) {
        formData.append("context", options.context);
      }

      if (fileName) {
        formData.append("file_name", fileName);
      }

      const response = await this.client.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error adding attachment to job ${jobId}:`, error);
      throw error;
    }
  }

  async deleteAttachment(jobId, attachmentId) {
    try {
      const url = this.buildUrl(`/jobs/${jobId}/attachments/${attachmentId}`);
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      console.error(
        `Error deleting attachment ${attachmentId} from job ${jobId}:`,
        error,
      );
      throw error;
    }
  }

  async getStatistics() {
    try {
      const url = this.buildUrl("/jobs/statistics");
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching job statistics:", error);
      throw error;
    }
  }

  async assignJob(jobId, data) {
    try {
      const url = this.buildUrl(`/jobs/${jobId}/assign`);
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error assigning job ${jobId}:`, error);
      throw error;
    }
  }
}

export default new JobService();
