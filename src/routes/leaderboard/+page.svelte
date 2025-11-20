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
        Who collected the most points over all afterwork sessions.
      </p>
    </header>

    {#if rows.length === 0}
      <div class="card">
        <p class="text-muted">No nominations yet, leaderboard will appear soon.</p>
      </div>
    {:else}
      <!-- Top 3 cards -->
      <section class="top-three">
        {#if rows[0]}
          <article class="card top-card top-gold">
            <div class="rank-pill">1</div>
            <div class="top-main">
              <div class="name-row">
                <span class="name">{rows[0].name}</span>
                <span class="label">Gold</span>
              </div>
              <div class="meta-row">
                <span class="stat">
                  <strong>{rows[0].points}</strong> pts
                </span>
                <span class="stat text-muted">
                  {rows[0].count}× nominated
                </span>
              </div>
            </div>
          </article>
        {/if}

        {#if rows[1]}
          <article class="card top-card top-silver">
            <div class="rank-pill">2</div>
            <div class="top-main">
              <div class="name-row">
                <span class="name">{rows[1].name}</span>
                <span class="label">Silver</span>
              </div>
              <div class="meta-row">
                <span class="stat">
                  <strong>{rows[1].points}</strong> pts
                </span>
                <span class="stat text-muted">
                  {rows[1].count}× nominated
                </span>
              </div>
            </div>
          </article>
        {/if}

        {#if rows[2]}
          <article class="card top-card top-bronze">
            <div class="rank-pill">3</div>
            <div class="top-main">
              <div class="name-row">
                <span class="name">{rows[2].name}</span>
                <span class="label">Bronze</span>
              </div>
              <div class="meta-row">
                <span class="stat">
                  <strong>{rows[2].points}</strong> pts
                </span>
                <span class="stat text-muted">
                  {rows[2].count}× nominated
                </span>
              </div>
            </div>
          </article>
        {/if}
      </section>

      <!-- Rest of the list -->
      {#if rows.length > 3}
        <section class="card rest-card">
          <!-- <h2>Everyone else</h2> -->
          <ul class="rest-list">
            {#each rows.slice(3) as row, i}
              <li>
                <div class="left">
                  <div class="small-rank">{i + 4}</div>
                  <div class="info">
                    <span class="name">{row.name}</span>
                    <span class="text-muted small">
                      {row.points} pts • {row.count}× nominated
                    </span>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </section>
      {/if}
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

  .top-three {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .top-card {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
  }

  .top-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.08;
    pointer-events: none;
  }

  .top-gold::before {
    background: radial-gradient(circle at top left, #F2B544, #F27405);
  }

  .top-silver::before {
    background: radial-gradient(circle at top left, #f4f4f4, #b0b0b0);
  }

  .top-bronze::before {
    background: radial-gradient(circle at top left, #F27405, #F24405);
  }

  .rank-pill {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    color: #2c1404;
    background: #F2B544;
    box-shadow: var(--shadow-subtle);
    z-index: 1;
  }

  .top-gold .rank-pill {
    background: #F2B544; /* gold from your palette */
  }

  .top-silver .rank-pill {
    background: #f0f0f0;
  }

  .top-bronze .rank-pill {
    background: #F27405; /* bronze-ish from your palette */
  }

  .top-main {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .name-row .label {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: rgba(0, 0, 0, 0.45);
    color: var(--color-primary-soft);
  }

  .name-row .name {
    font-weight: 600;
    font-size: 1rem;
  }

  .meta-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    font-size: 0.8rem;
  }

  .stat strong {
    font-size: 0.95rem;
  }

  /* Rest list */

  .rest-card h2 {
    margin-bottom: 8px;
    font-size: 0.95rem;
  }

  .rest-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rest-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .rest-list .left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .small-rank {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    border: 1px solid rgba(242, 181, 68, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: var(--color-primary-soft);
  }

  .rest-list .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .rest-list .name {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .small {
    font-size: 0.75rem;
  }
</style>
