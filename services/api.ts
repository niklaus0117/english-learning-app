import { CONFIG, MOCK_COURSES, MOCK_USER } from '../constants';
import { Course, User, ApiResponse } from '../types';

/**
 * Simulates a delay to mimic network latency
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  async login(phoneNumber: string): Promise<User> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(800);
      return { ...MOCK_USER, phoneNumber };
    } else {
      const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data: ApiResponse<User> = await response.json();
      return data.data;
    }
  }

  async getCourses(): Promise<Course[]> {
    if (CONFIG.USE_MOCK_DATA) {
      await delay(500);
      return MOCK_COURSES;
    } else {
      const response = await fetch(`${CONFIG.API_BASE_URL}/courses/recommend`);
      const data: ApiResponse<Course[]> = await response.json();
      return data.data;
    }
  }
}

export const apiService = new ApiService();