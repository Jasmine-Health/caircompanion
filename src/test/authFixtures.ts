import type { User } from '../types';

export const mockPatientUser: User = {
  email: 'joe@example.com',
  first_name: 'Joe',
  last_name: 'Example',
  is_active: true,
  agreed_to_sms: false,
  role: 'patient',
  timezone: 'UTC',
  createdAt: '',
  updatedAt: '',
};

export const mockRegisterUser: User = {
  email: 'jane@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  is_active: true,
  agreed_to_sms: false,
  role: 'patient',
  timezone: 'UTC',
  createdAt: '',
  updatedAt: '',
};

export const mockAuthActionResult = { message: 'ok', success: true };
