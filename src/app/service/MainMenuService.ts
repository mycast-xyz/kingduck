import { writable } from 'svelte/store';

const navActive = writable<boolean>(false);
const userNavActive = writable<boolean>(false);
// 메인 메뉴(사이드바) 너비. 접힘 80 / 펼침 240
const mainMenuActive = writable<number>(240);

export { navActive, userNavActive, mainMenuActive };
