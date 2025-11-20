<script lang="ts">
  import { auth } from '$lib/firebase';
  import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
  } from 'firebase/auth';

  let email = '';
  let password = '';
  let isSignup = false;
  let error = '';
  let loading = false;

  async function submit() {
    error = '';
    loading = true;
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      error = e.message ?? 'Something went wrong';
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-wrapper">
  <div class="logo-badge">
    <span>🍻</span>
  </div>

  <h1>Treindag Top 3</h1>
  <!-- <p class="text-muted">Nominate your colleagues once a month and see who shines.</p> -->

  <div class="card auth-card">
    {#if error}<p class="auth-error">{error}</p>{/if}

    <form on:submit|preventDefault={submit}>
      <div class="form-field">
        <label>Email</label>
        <input type="email" bind:value={email} required />
      </div>

      <div class="form-field">
        <label>Password</label>
        <input type="password" bind:value={password} required minlength="6" />
      </div>

      <button type="submit" disabled={loading}>
        {#if loading}…{/if}
        {isSignup ? 'Create account' : 'Log in'}
      </button>
    </form>

    <button class="link-switch" type="button" on:click={() => (isSignup = !isSignup)}>
      {#if isSignup}
        Already have an account? Log in
      {:else}
        Create an account
      {/if}
    </button>
  </div>
</div>

<style>
  .auth-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    text-align: center;
    padding-top: 28px;
  }

  .logo-badge {
    width: 64px;
    height: 64px;
    border-radius: 24px;
    background: radial-gradient(circle at 30% 20%, #F2B544, #F27405);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-soft);
    margin-bottom: 6px;
    font-size: 1.8rem;
  }

  .auth-card {
    width: 100%;
    margin-top: 10px;
  }

  .auth-error {
    background: rgba(242, 68, 5, 0.1);
    border-radius: 10px;
    padding: 6px 8px;
    color: #ffb3a2;
    font-size: 0.8rem;
    margin-bottom: 8px;
  }

  .link-switch {
    margin-top: 10px;
    width: 100%;
    background: transparent;
    color: var(--color-primary-soft);
    border: none;
    box-shadow: none;
    padding: 6px 0 0;
    font-size: 0.8rem;
  }
</style>
