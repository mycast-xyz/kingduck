import { writable } from "svelte/store";

const mainMenuActive = writable<number>(80);
const navActive = writable<boolean>(false);

export {mainMenuActive,navActive};