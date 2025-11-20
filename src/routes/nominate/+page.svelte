<script lang="ts">
	import { db, serverTimestamp } from '$lib/firebase';
	import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
	import { user } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	type Colleague = { id: string; name: string };

	let colleagues: Colleague[] = [];
	let searchTerm = '';
	let selected: Colleague[] = [];
	let loading = true;
	let saving = false;
	let message = '';

	const colleaguesRef = collection(db, 'colleagues');
	const nominationsRef = collection(db, 'nominations');

	const today = new Date();
	const sessionDate = today.toISOString().slice(0, 10); // YYYY-MM-DD

	// load colleagues once
	onMount(async () => {
		const qCol = query(colleaguesRef, orderBy('name'));
		const snap = await getDocs(qCol);
		colleagues = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
		loading = false;
	});

	// filtered list
	$: filtered =
		searchTerm.trim().length === 0
			? colleagues
			: colleagues.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

	function toggleSelect(col: Colleague) {
		const exists = selected.find((c) => c.id === col.id);
		if (exists) {
			selected = selected.filter((c) => c.id !== col.id);
		} else {
			if (selected.length >= 3) return;
			selected = [...selected, col];
		}
	}

	function moveUp(index: number) {
		if (index === 0) return;
		const copy = [...selected];
		[copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
		selected = copy;
	}

	function moveDown(index: number) {
		if (index === selected.length - 1) return;
		const copy = [...selected];
		[copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
		selected = copy;
	}

	async function createNewColleague(name: string): Promise<Colleague> {
		const docRef = await addDoc(colleaguesRef, {
			name,
			createdAt: serverTimestamp()
		});
		const newCol = { id: docRef.id, name };
		colleagues = [...colleagues, newCol].sort((a, b) => a.name.localeCompare(b.name));
		return newCol;
	}

	async function ensureSelectedFromSearch() {
		const trimmed = searchTerm.trim();
		if (!trimmed) return;
		// if exact match exists, select it; else create
		const existing = colleagues.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
		if (existing) {
			toggleSelect(existing);
		} else {
			if (selected.length >= 3) return;
			const newCol = await createNewColleague(trimmed);
			toggleSelect(newCol);
		}
		searchTerm = '';
	}

	async function saveNomination() {
		if (selected.length !== 3) return;
		saving = true;
		message = '';
		try {
			const u = get(user);
			if (!u) throw new Error('Not logged in');

			await addDoc(nominationsRef, {
				voterId: u.uid,
				sessionDate,
				nominees: selected.map((c) => c.id),
				createdAt: serverTimestamp()
			});

			// ✅ success: show message + reset UI
			message = 'Nomination saved!';
			selected = [];
			searchTerm = '';
		} catch (e: any) {
			message = e.message ?? 'Could not save nomination';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Nominate • Afterwork Top 3</title>
</svelte:head>

{#if loading}
	<p class="text-muted">Loading colleagues…</p>
{:else}
	<section class="nominate-page">
		<header class="card nominate-header">
			<h1>Nominate your Top 3</h1>
			<p class="text-muted">Session date: {sessionDate}</p>
		</header>

		<div class="card nominate-card">
			<div class="form-field">
				<label>Search or add colleague</label>
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Type a name…"
					on:keydown={(e) => e.key === 'Enter' && ensureSelectedFromSearch()}
				/>
			</div>

			{#if searchTerm.trim().length > 0}
				<button
					class="button ghost use-name"
					on:click={ensureSelectedFromSearch}
					disabled={selected.length >= 3}
				>
					Use “{searchTerm.trim()}”
				</button>
			{/if}
		</div>

		<section class="card list-card">
			<h2>Suggestions</h2>
			<div class="chip-list">
				{#each filtered as c}
					<button
						type="button"
						class:selected={selected.some((s) => s.id === c.id)}
						on:click={() => toggleSelect(c)}
					>
						{c.name}
					</button>
				{/each}
			</div>
		</section>

		<section class="card list-card">
			<h2>Selected (Top 3)</h2>
			{#if selected.length === 0}
				<p class="text-muted">No colleagues selected yet.</p>
			{:else}
				<ol class="selected-list">
					{#each selected as c, i}
						<li>
							<div class="left">
								<div class="rank-badge">{i + 1}</div>
								<div class="info">
									<span>{c.name}</span>
									<span class="points-pill">
										{i === 0 ? '3 pts' : i === 1 ? '2 pts' : '1 pt'}
									</span>
								</div>
							</div>
							<div class="actions">
								<button class="ghost" on:click={() => moveUp(i)}>↑</button>
								<button class="ghost" on:click={() => moveDown(i)}>↓</button>
							</div>
						</li>
					{/each}
				</ol>
			{/if}

			{#if selected.length === 3}
				<button class="save-btn" on:click={saveNomination} disabled={saving}>
					{saving ? 'Saving…' : 'Save nomination'}
				</button>
			{/if}

			{#if message}<p class="text-muted">{message}</p>{/if}
		</section>
	</section>
{/if}

<style>
	.nominate-page {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.nominate-header {
		background: linear-gradient(135deg, #f27405, #f2b544);
		color: #2c1404;
	}

	.nominate-header .text-muted {
		color: rgba(25, 10, 4, 0.7);
	}

	.nominate-card {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.use-name {
		align-self: flex-start;
		padding-inline: 14px;
	}

	.list-card h2 {
		margin-bottom: 8px;
	}

	.chip-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		max-height: 190px;
		overflow-y: auto;
		padding-right: 4px;
	}

	.chip-list button {
		background: rgba(242, 181, 68, 0.12);
		border-radius: var(--radius-pill);
		border: 1px solid rgba(242, 181, 68, 0.45);
		padding: 6px 10px;
		font-size: 0.8rem;
    color: #a86018;
	}

	.chip-list button.selected {
		background: var(--color-primary);
		color: #2c1404;
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
		gap: 10px;
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

	.actions button {
		font-size: 0.8rem;
		padding-inline: 14px;
	}

	.save-btn {
		width: 100%;
		margin-top: 10px;
	}
</style>
