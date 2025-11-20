<script lang="ts">
  // optional: you can import the user store to show the logged in user
  import { user } from '$lib/stores/auth';
</script>

<h1>Afterwork Top 3</h1>
<p>Use the tabs below to nominate colleagues, view your history, or see the leaderboard.</p>

{#if $user}
  <p>Logged in as {$user.email}</p>
{/if}
