import client from './api/client';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { toastStore } from './ToastService';

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
			// 실패를 가짜 사용자로 위장하지 않는다 (F-T1).
			console.error('Failed to fetch users:', error);
			this._users.set([]);
			this._total.set(0);
			if (browser) {
				toastStore.error('사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
			}
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
			// 실패를 가짜 상세로 위장하지 않는다 (F-T1).
			console.error(`Failed to fetch user detail for ${id}:`, error);
			this._currentUser.set(null);
			if (browser) {
				toastStore.error('사용자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
			}
		}
	}

	// Keep status update for compatibility if needed, or remove if strictly following swagger
	async updateUserStatus(id: string, status: 'ACTIVE' | 'BANNED') {
		try {
			const response = await client.patch(`/api/v0/admin/user/${id}/status`, { status });
			return response.status === 200;
		} catch (error) {
			console.error(`Failed to update user status for ${id}:`, error);
			return false;
		}
	}

}

export const adminUserService = new AdminUserService();
