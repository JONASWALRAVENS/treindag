<script lang="ts">
  import { db } from '$lib/firebase';
  import {
    collection,
    getDocs,
    query,
    where,
    orderBy
  } from 'firebase/firestore';
  import { user } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  type Colleague = { id: string; name: string };
  type Nomination = {
    id: string;
    sessionDate: string;
    nominees: string[];
  };

  let nominations: Nomination[] = [];
  let colleaguesById: Record<string, Colleague> = {};
  let loading = true;

  const nominationsRef = collection(db, 'nominations');
  const colleaguesRef = collection(db, 'colleagues');

  async function loadData() {
    loading = true;
    const u = get(user);
    if (!u) {
      loading = false;
      return;
    }

    // get colleagues
    const colSnap = await getDocs(colleaguesRef);
    colleaguesById = {};
    colSnap.forEach((d) => {
      const data = d.data() as any;
      colleaguesById[d.id] = { id: d.id, name: data.name };
    });

    // get nominations for this user
    const qNom = query(
      nominationsRef,
      where('voterId', '==', u.uid),
      orderBy('sessionDate', 'desc')
    );
    const nomSnap = await getDocs(qNom);
    nominations = nomSnap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        sessionDate: data.sessionDate,
        nominees: data.nominees
      };
    });

    loading = false;
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>My nominations • Afterwork Top 3</title>
</svelte:head>

{#if loading}
  <p class="text-muted">Loading…</p>
{:else}
  <section class="my-page" in:fade={{ duration: 300 }}>
    <header class="card my-header">
      <h1>My nominations</h1>
      <p class="text-muted">
        A quick overview of everyone you’ve voted for so far.
      </p>
    </header>

    {#if nominations.length === 0}
      <div class="card">
        <p class="text-muted">No nominations yet. Time to find the weakest link ✨</p>
      </div>
    {:else}
      <div class="my-list">
        {#each nominations as nom}
          <article class="card nomination-card">
            <header class="nom-header">
              <div class="date-pill">
                {nom.sessionDate}
              </div>
              <span class="badge">Top 3</span>
            </header>

            <ol class="selected-list">
              {#each nom.nominees as id, i}
                <li>
                  <div class="left">
                    <div class="rank-badge">{i + 1}</div>
                    <div class="info">
                      <span>
                        {#if colleaguesById[id]}
                          {colleaguesById[id].name}
                        {:else}
                          <em>Unknown colleague</em>
                        {/if}
                      </span>
                      <!-- <span class="points-pill">
                        {i === 0 ? '3 pts' : i === 1 ? '2 pts' : '1 pt'}
                      </span> -->
                    </div>
                  </div>
                </li>
              {/each}
            </ol>
          </article>
        {/each}
      </div>
    {/if}
  </section>
{/if}

<style>
  .my-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .my-header {
    background: linear-gradient(135deg, #F27405, #F2B544);
    color: #2c1404;
  }

  .my-header .text-muted {
    color: rgba(24, 9, 5, 0.7);
  }

  .my-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .nomination-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nom-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }

  .date-pill {
    font-size: 0.8rem;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    background: rgba(242, 181, 68, 0.12);
    color: var(--color-primary-soft);
  }

  .selected-list {
    list-style: none;
    padding: 0;
    margin: 4px 0 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .selected-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .selected-list .left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rank-badge {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: var(--color-primary-soft);
    color: #2c1404;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .selected-list .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .points-pill {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    background: rgba(242, 181, 68, 0.18);
    color: var(--color-primary-soft);
  }
</style>
