<script lang="ts">
  import { db } from '$lib/firebase';
  import { collection, getDocs } from 'firebase/firestore';
  import { onMount } from 'svelte';

  type Colleague = { id: string; name: string };
  type Row = { id: string; name: string; points: number; count: number };

  let rows: Row[] = [];
  let loading = true;

  const colleaguesRef = collection(db, 'colleagues');
  const nominationsRef = collection(db, 'nominations');

  onMount(async () => {
    loading = true;

    const [colSnap, nomSnap] = await Promise.all([
      getDocs(colleaguesRef),
      getDocs(nominationsRef)
    ]);

    const colleagues: Record<string, Colleague> = {};
    colSnap.forEach((d) => {
      const data = d.data() as any;
      colleagues[d.id] = { id: d.id, name: data.name };
    });

    const points: Record<string, number> = {};
    const counts: Record<string, number> = {};

    nomSnap.forEach((d) => {
      const data = d.data() as any;
      const nominees: string[] = data.nominees ?? [];
      nominees.forEach((id: string, index: number) => {
        const pts = index === 0 ? 3 : index === 1 ? 2 : 1;
        points[id] = (points[id] ?? 0) + pts;
        counts[id] = (counts[id] ?? 0) + 1;
      });
    });

    rows = Object.keys(points)
      .map((id) => ({
        id,
        name: colleagues[id]?.name ?? 'Unknown',
        points: points[id],
        count: counts[id] ?? 0
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return a.name.localeCompare(b.name);
      });

    loading = false;
  });
</script>

<svelte:head>
  <title>Leaderboard • Afterwork Top 3</title>
</svelte:head>

{#if loading}
  <p class="text-muted">Loading leaderboard…</p>
{:else}
  <section class="leaderboard-page">
    <header class="card leaderboard-header">
      <h1>Leaderboard</h1>
      <p class="text-muted">
        Total points and nominations across everyone.
      </p>
    </header>

    {#if rows.length === 0}
      <div class="card">
        <p class="text-muted">No nominations yet, leaderboard will appear soon.</p>
      </div>
    {:else}
      <section class="card leaderboard-card">
        <div class="leaderboard-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Points</th>
                <th>Times</th>
              </tr>
            </thead>
            <tbody>
              {#each rows as row, i}
                <tr class={i === 0 ? 'top top-1' : i === 1 ? 'top top-2' : i === 2 ? 'top top-3' : ''}>
                  <td>{i + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.points}</td>
                  <td>{row.count}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}
  </section>
{/if}

<style>
  .leaderboard-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .leaderboard-header {
    background: radial-gradient(circle at top left, #F2B544, #F27405);
    color: #2c1404;
  }

  .leaderboard-header .text-muted {
    color: rgba(24, 9, 5, 0.7);
  }

  .leaderboard-card {
    padding: 10px 10px 6px;
  }

  .leaderboard-scroll {
    max-height: 340px;
    overflow-y: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }

  thead {
    position: sticky;
    top: 0;
    background: rgba(15, 5, 3, 0.96);
    backdrop-filter: blur(10px);
    z-index: 1;
  }

  th,
  td {
    padding: 6px 4px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    font-weight: 600;
    color: var(--color-primary-soft);
    border-bottom: 1px solid rgba(242, 181, 68, 0.35);
  }

  tbody tr:nth-child(odd):not(.top) {
    background: rgba(242, 181, 68, 0.05);
  }

  tbody tr:nth-child(even):not(.top) {
    background: transparent;
  }

  tbody tr.top-1 {
    background: rgba(242, 181, 68, 0.24);
  }

  tbody tr.top-2 {
    background: rgba(242, 181, 68, 0.16);
  }

  tbody tr.top-3 {
    background: rgba(242, 181, 68, 0.12);
  }

  td:first-child {
    font-weight: 600;
    width: 28px;
  }

  td:nth-child(3),
  td:nth-child(4) {
    text-align: right;
  }

  @media (max-width: 360px) {
    th:nth-child(4),
    td:nth-child(4) {
      display: none; /* hide "Times" on super small phones if needed */
    }
  }
</style>
