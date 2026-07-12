import type { Role } from '$lib/data';

function createAppState() {
	let authenticated = $state(false);
	let role = $state<Role>('admin');
	let isDark = $state(false);
	let sidebarCollapsed = $state(false);

	return {
		get authenticated() {
			return authenticated;
		},
		get role() {
			return role;
		},
		get isDark() {
			return isDark;
		},
		get sidebarCollapsed() {
			return sidebarCollapsed;
		},
		login(r: Role) {
			role = r;
			authenticated = true;
		},
		logout() {
			authenticated = false;
		},
		toggleTheme() {
			isDark = !isDark;
		},
		toggleSidebar() {
			sidebarCollapsed = !sidebarCollapsed;
		}
	};
}

export const appState = createAppState();