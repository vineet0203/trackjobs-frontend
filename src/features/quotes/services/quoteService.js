// features/quotes/services/quoteService.js
import BaseApiService from '../../../services/api/baseApiService';
import { transformQuoteFromApi, transformQuoteForApi } from '../utils/quoteTransformers';

class QuoteService extends BaseApiService {
  constructor() {
    super('quotes', { vendorIdInPath: true });
  }

  async getAll(params = {}) {
    try {
      console.log('QuoteService.getAll called with params:', params);
      const response = await super.getAll(params);
      console.log('Raw API response:', response);
      
      // Extract data from the response structure
      // Your API returns: { success: true, message: "...", data: [], meta: {...}, links: {...} }
      
      let quotes = [];
      let paginationData = {
        total: 0,
        perPage: 15,
        currentPage: 1,
        totalPages: 1,
        from: null,
        to: null,
      };

      // Check if response has the expected structure
      if (response && response.data) {
        // If data is an array directly
        if (Array.isArray(response.data)) {
          quotes = response.data;
        } 
        // If data is nested under response.data.data
        else if (response.data.data && Array.isArray(response.data.data)) {
          quotes = response.data.data;
        }
      } else if (response && Array.isArray(response)) {
        // If response itself is an array
        quotes = response;
      }

      // Transform each quote
      const transformedQuotes = quotes.map(transformQuoteFromApi);

      // Extract pagination from meta
      if (response?.meta) {
        paginationData = {
          total: response.meta.total || 0,
          perPage: response.meta.per_page || 15,
          currentPage: response.meta.current_page || 1,
          totalPages: response.meta.last_page || 1,
          from: response.meta.from || null,
          to: response.meta.to || null,
        };
      } else if (response?.data?.meta) {
        paginationData = {
          total: response.data.meta.total || 0,
          perPage: response.data.meta.per_page || 15,
          currentPage: response.data.meta.current_page || 1,
          totalPages: response.data.meta.last_page || 1,
          from: response.data.meta.from || null,
          to: response.data.meta.to || null,
        };
      }

      console.log('Transformed quotes:', transformedQuotes);
      console.log('Pagination data:', paginationData);

      return {
        data: transformedQuotes,
        pagination: paginationData,
        links: response?.links || response?.data?.links || {},
      };

    } catch (error) {
      console.error('Error in QuoteService.getAll:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await super.getById(id);
      // Handle response structure: { success: true, data: {...}, ... }
      const quoteData = response?.data || response;
      return transformQuoteFromApi(quoteData);
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error);
      throw error;
    }
  }

  async create(data) {
    try {
      const apiData = transformQuoteForApi(data);
      const response = await super.create(apiData);
      // Handle response structure
      const quoteData = response?.data || response;
      return transformQuoteFromApi(quoteData);
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const apiData = transformQuoteForApi(data);
      const response = await super.update(id, apiData);
      // Handle response structure
      const quoteData = response?.data || response;
      return transformQuoteFromApi(quoteData);
    } catch (error) {
      console.error(`Error updating quote ${id}:`, error);
      throw error;
    }
  }

  // Custom methods
  async sendQuote(id) {
    try {
      const url = this.buildUrl(`/quotes/${id}/send`);
      const response = await this.client.post(url);
      return response.data;
    } catch (error) {
      console.error(`Error sending quote ${id}:`, error);
      throw error;
    }
  }

  async duplicateQuote(id) {
    try {
      const url = this.buildUrl(`/quotes/${id}/duplicate`);
      const response = await this.client.post(url);
      const quoteData = response?.data?.data || response?.data || response;
      return transformQuoteFromApi(quoteData);
    } catch (error) {
      console.error(`Error duplicating quote ${id}:`, error);
      throw error;
    }
  }

  async downloadQuote(id, format = 'pdf') {
    try {
      const url = this.buildUrl(`/quotes/${id}/download`);
      const response = await this.client.get(url, {
        params: { format },
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `quote-${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      return response.data;
    } catch (error) {
      console.error(`Error downloading quote ${id}:`, error);
      throw error;
    }
  }

  async getQuoteStats() {
    try {
      const url = this.buildUrl('/quotes/statistics');
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching quote stats:', error);
      throw error;
    }
  }

  async getQuoteByNumber(quoteNumber) {
    try {
      const url = this.buildUrl(`/quotes/number/${quoteNumber}`);
      const response = await this.client.get(url);
      const quoteData = response?.data?.data || response?.data || response;
      return transformQuoteFromApi(quoteData);
    } catch (error) {
      console.error(`Error fetching quote by number ${quoteNumber}:`, error);
      throw error;
    }
  }

  async convertQuoteToJob(id) {
    try {
      const url = this.buildUrl(`/quotes/${id}/convert-to-job`);
      const response = await this.client.post(url);
      return response.data;
    } catch (error) {
      console.error(`Error converting quote ${id} to job:`, error);
      throw error;
    }
  }

  async updateFollowUpStatus(id, status) {
    try {
      const url = this.buildUrl(`/quotes/${id}/follow-up-status`);
      const response = await this.client.post(url, { status });
      const quoteData = response?.data?.data || response?.data || response;
      return transformQuoteFromApi(quoteData);
    } catch (error) {
      console.error(`Error updating follow-up status for quote ${id}:`, error);
      throw error;
    }
  }
}

export default new QuoteService();