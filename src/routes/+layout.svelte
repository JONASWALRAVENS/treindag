<script lang="ts">
  import '../app.css';

  import { user, authReady } from '$lib/stores/auth';
  import AuthPage from './auth/+page.svelte';
  import { page } from '$app/stores';
  import { signOut } from 'firebase/auth';
  import { auth } from '$lib/firebase';

  $: $authReady = $authReady;
  $: $user = $user;

  let showProfileMenu = false;

  async function logout() {
    showProfileMenu = false;
    await signOut(auth);
  }
</script>

<div class="app-root">
  {#if !$authReady}
    <div class="app-main">
      <p class="text-muted">Loading…</p>
    </div>
  {:else if !$user}
    <div class="app-main">
      <AuthPage />
    </div>
  {:else}
    <div class="app-main">
      <slot />
    </div>

    <!-- bottom nav -->
    <nav class="bottom-tabs">
      <a
        href="/nominate"
        class:selected={$page.url.pathname === '/nominate'}
      >
        <span class="icon">⭐</span>
        <span>Nominate</span>
      </a>
      <a href="/my" class:selected={$page.url.pathname === '/my'}>
        <span class="icon">📜</span>
        <span>My</span>
      </a>
      <a
        href="/leaderboard"
        class:selected={$page.url.pathname === '/leaderboard'}
      >
        <span class="icon">🏆</span>
        <span>Top</span>
      </a>

      <button
        class="tab-profile"
        type="button"
        on:click={() => (showProfileMenu = !showProfileMenu)}
        aria-label="Profile menu"
      >
        <span class="avatar">
          {#if $user?.email}
            {($user.email[0] ?? 'U').toUpperCase()}
          {:else}
            U
          {/if}
        </span>
      </button>
    </nav>

    {#if showProfileMenu}
      <!-- click-outside backdrop -->
      <div
        class="profile-menu-backdrop"
        on:click={() => (showProfileMenu = false)}
      ></div>

      <div class="profile-menu card">
        <!-- <div class="profile-row">
          <div class="avatar-lg">
            {#if $user?.email}
              {($user.email[0] ?? 'U').toUpperCase()}
            {:else}
              U
            {/if}
          </div>
          <div class="profile-text">
            <span class="email">{$user?.email}</span>
            <span class="text-muted small">Signed in</span>
          </div>
        </div> -->

        <button class="logout-btn" type="button" on:click={logout}>
          Log out
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .bottom-tabs {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 6px 10px calc(6px + var(--safe-bottom));
    background: rgba(14, 4, 2, 0.97);
    border-top: 1px solid rgba(242, 181, 68, 0.25);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 20;
  }

  .bottom-tabs a {
    flex: 1;
    text-decoration: none;
    color: var(--color-text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 0.7rem;
    padding: 6px 4px;
    border-radius: var(--radius-pill);
  }

  .bottom-tabs a .icon {
    font-size: 1.1rem;
  }

  .bottom-tabs a.selected {
    background: linear-gradient(135deg, var(--color-primary-soft), var(--color-primary));
    color: #2c1404;
    box-shadow: var(--shadow-subtle);
    font-weight: 600;
  }

  .tab-profile {
    border-radius: 999px;
    padding: 4px;
    background: rgba(0, 0, 0, 0.4);
    /* border: 1px solid rgba(242, 181, 68, 0.6); */
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--color-primary-soft);
    color: #2c1404;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
  }

  /* Profile menu overlay */

  .profile-menu-backdrop {
    position: fixed;
    inset: 0;
    background: transparent; /* just for click-outside */
    z-index: 25;
  }

  .profile-menu {
    position: fixed;
    bottom: calc(58px + var(--safe-bottom)); /* just above nav */
    right: 12px;
    width: 220px;
    z-index: 30;
    padding: 10px 12px 12px;
  }

  .profile-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .avatar-lg {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: var(--color-primary-soft);
    color: #2c1404;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .profile-text .email {
    font-size: 0.85rem;
    font-weight: 500;
  }

  .profile-text .small {
    font-size: 0.75rem;
  }

  .logout-btn {
    width: 100%;
    margin-top: 4px;
    background: var(--color-danger);
    color: white;
  }
</style>
