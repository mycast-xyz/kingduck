import { writable } from 'svelte/store';

const navActive = writable<boolean>(false);
const userNavActive = writable<boolean>(false);

export { navActive, userNavActive };
