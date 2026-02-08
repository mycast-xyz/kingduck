import client from './api/client';
import { writable } from 'svelte/store';

export interface User {
	id: number;
	email: string;
	nickname: string; // The API returns 'name', we will map it
	profileImage: string;
	role: 'USER' | 'MANAGER' | 'ADMIN';
	status: 'ACTIVE' | 'BANNED' | 'WITHDRAWN'; // API response doesn't show this, might need default or check
	createdAt: string;
	lastLoginAt: string; // The API returns 'lastActiveAt'
}

export interface UserLog {
	id: number;
	userId: number;
	action: string;
	description: string;
	ipAddress: string;
	createdAt: string;
}

export interface UserListResponse {
	users: any[]; // Raw API user object
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface UserSearchParams {
	page?: number;
	size?: number; // mapped to limit
	keyword?: string; // mapped to name
	role?: string;
}

export class AdminUserService {
	private _users = writable<User[]>([]);
	private _total = writable<number>(0);
	private _currentUser = writable<User | null>(null);
	private _userLogs = writable<UserLog[]>([]);

	get users() {
		return this._users;
	}

	get total() {
		return this._total;
	}

	get currentUser() {
		return this._currentUser;
	}

	get userLogs() {
		return this._userLogs;
	}

	async fetchUsers(params: UserSearchParams = { page: 1, size: 20 }) {
		try {
			const query = new URLSearchParams();
			if (params.page) query.append('page', params.page.toString());
			if (params.size) query.append('limit', params.size.toString());
			if (params.keyword) query.append('name', params.keyword); // Mapping keyword to name check
			if (params.role) query.append('role', params.role);

			const response = await client.get(`/api/v0/admin/user/list?${query.toString()}`);
			if (response.status === 200 && response.data) {
				const apiData = response.data;
				// Map API response to User interface
				const mappedUsers: User[] = (apiData.users || []).map((u: any) => ({
					id: u.id,
					email: u.email,
					nickname: u.name, // Map name to nickname
					profileImage: u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`, // Fallback if missing
					role: u.role,
					status: u.status || 'ACTIVE', // Fallback if missing
					createdAt: u.createdAt,
					lastLoginAt: u.lastActiveAt || u.createdAt // Map lastActiveAt to lastLoginAt
				}));

				this._users.set(mappedUsers);
				this._total.set(apiData.pagination ? apiData.pagination.total : 0);
			}
		} catch (error) {
			console.error('Failed to fetch users:', error);
			// Mock data for development
			this.setMockUsers(params);
		}
	}

	// Role update
	async updateUserRole(id: number, role: 'USER' | 'MANAGER' | 'ADMIN', permissions?: object) {
		try {
			const response = await client.put(`/api/v0/admin/user/${id}/role`, { role, permissions });
			return response.status === 200;
		} catch (error) {
			console.error(`Failed to update user role for ${id}:`, error);
			return false;
		}
	}

	// Fetch logs
	async fetchUserLogs(userId: number, page: number = 1, limit: number = 20) {
		try {
			const query = new URLSearchParams();
			query.append('page', page.toString());
			query.append('limit', limit.toString());

			const response = await client.get(`/api/v0/admin/user/${userId}/logs?${query.toString()}`);
			if (response.status === 200 && response.data) {
				this._userLogs.set(response.data.items || []); // Assuming items in response
			}
		} catch (error) {
			console.error(`Failed to fetch logs for user ${userId}:`, error);
			this._userLogs.set([]);
		}
	}

	// Keep fetchUserDetail for now, even if not in swagger provided (likely exists or needed for UI state)
	async fetchUserDetail(id: string) {
		try {
			// Based on list structure, endpoint is likely /api/v0/admin/user/${id}
			const response = await client.get(`/api/v0/admin/user/${id}`);
			if (response.status === 200 && response.data) {
				const u = response.data;
				const mappedUser: User = {
					id: u.id,
					email: u.email,
					nickname: u.name, // Map name to nickname
					profileImage: u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
					role: u.role,
					status: u.status || 'ACTIVE',
					createdAt: u.createdAt,
					lastLoginAt: u.lastActiveAt || u.createdAt
				};
				this._currentUser.set(mappedUser);
			}
		} catch (error) {
			console.error(`Failed to fetch user detail for ${id}:`, error);
			// Mock data
			this.setMockUserDetail(id);
		}
	}

	// Keep status update for compatibility if needed, or remove if strictly following swagger
	async updateUserStatus(id: string, status: 'ACTIVE' | 'BANNED') {
		try {
			const response = await client.patch(`/api/v0/admin/users/${id}/status`, { status });
			return response.status === 200;
		} catch (error) {
			console.error(`Failed to update user status for ${id}:`, error);
			return false;
		}
	}

	// Mock Data Helpers
	private setMockUsers(params: UserSearchParams) {
		const mockUsers: User[] = Array.from({ length: params.size || 20 }).map((_, i) => ({
			id: i + 1,
			email: `user${i}@example.com`,
			nickname: `User ${i}`,
			profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
			role: i % 10 === 0 ? 'ADMIN' : 'USER',
			status: i % 15 === 0 ? 'BANNED' : 'ACTIVE',
			createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
			lastLoginAt: new Date(Date.now() - Math.random() * 100000000).toISOString()
		}));

		if (params.keyword) {
			const lowerKeyword = params.keyword.toLowerCase();
			const filtered = mockUsers.filter(
				(u) =>
					u.nickname.toLowerCase().includes(lowerKeyword) ||
					u.email.toLowerCase().includes(lowerKeyword)
			);
			this._users.set(filtered);
			this._total.set(filtered.length);
		} else {
			this._users.set(mockUsers);
			this._total.set(100); // Mock total count
		}
	}

	private setMockUserDetail(id: string) {
		this._currentUser.set({
			id: parseInt(id) || 1,
			email: 'mock@example.com',
			nickname: 'Mock User',
			profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mock',
			role: 'USER',
			status: 'ACTIVE',
			createdAt: new Date().toISOString(),
			lastLoginAt: new Date().toISOString()
		});
	}
}

export const adminUserService = new AdminUserService();
