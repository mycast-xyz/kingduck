import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
	let initialTheme: Theme = 'system';

	if (browser) {
		const storedTheme = localStorage.getItem('theme') as Theme;
		if (storedTheme) {
			initialTheme = storedTheme;
		} else {
			initialTheme = 'system';
		}
		applyTheme(initialTheme);
	}

	const { subscribe, set, update } = writable<Theme>(initialTheme);

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('theme', theme);
				applyTheme(theme);
			}
			set(theme);
		},
		toggle: () => {
			if (browser) {
				update((currentTheme) => {
					const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
					localStorage.setItem('theme', newTheme);
					applyTheme(newTheme);
					return newTheme;
				});
			}
		}
	};
}

function applyTheme(theme: Theme) {
	if (theme === 'dark') {
		document.documentElement.classList.add('dark');
	} else if (theme === 'light') {
		document.documentElement.classList.remove('dark');
	} else {
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
}

export const theme = createThemeStore();
