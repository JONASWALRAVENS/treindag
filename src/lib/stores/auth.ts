import { writable } from 'svelte/store';
import type { AuthUser } from '$lib/firebase';
import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const user = writable<AuthUser | null>(null);
export const authReady = writable(false);

onAuthStateChanged(auth, (u) => {
  user.set(u);
  authReady.set(true);
});
