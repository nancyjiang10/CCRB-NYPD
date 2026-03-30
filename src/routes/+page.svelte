<script>
  import ArticleHeader from '$lib/components/ArticleHeader.svelte';

  let { data } = $props();
  let selected = $state(null);
  let selectedAllegation = $state('All Allegations');
  let selectedCommand = $state('All Commands');
  let selectedSort = $state('Date: Newest');

  const recordKey = (record) =>
    record.allegation_record_identity ??
    `${record.complaint_id ?? 'unknown'}-${record.complaint_officer_number ?? '0'}`;

  const allegationOptions = $derived(
    [...new Set(data.police.map((record) => record.allegation).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    )
  );

  const commandOptions = $derived(
    [...new Set(data.police.map((record) => record.officer_command_at_incident).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b)
    )
  );

  const filteredRecords = $derived(
    data.police.filter((record) => {
      const matchesAllegation =
        selectedAllegation === 'All Allegations' || record.allegation === selectedAllegation;
      const matchesCommand =
        selectedCommand === 'All Commands' || record.officer_command_at_incident === selectedCommand;
      return matchesAllegation && matchesCommand;
    })
  );

  const sortedRecords = $derived(
    [...filteredRecords].sort((a, b) => {
      if (selectedSort === 'Date: Oldest') {
        return new Date(a.as_of_date ?? 0).getTime() - new Date(b.as_of_date ?? 0).getTime();
      }

      if (selectedSort === 'Complaint ID: Asc') {
        return Number(a.complaint_id ?? 0) - Number(b.complaint_id ?? 0);
      }

      if (selectedSort === 'Complaint ID: Desc') {
        return Number(b.complaint_id ?? 0) - Number(a.complaint_id ?? 0);
      }

      return new Date(b.as_of_date ?? 0).getTime() - new Date(a.as_of_date ?? 0).getTime();
    })
  );

  let headline = 'Civilian Allegations Against NYPD Officers';
  let byline = 'NYCity News Service';
  let pubDate = '2026-03-16';
</script>

<svelte:head>
  <title>{headline} | NYCity News Service</title>
</svelte:head>

<div class="container">
  <ArticleHeader
    {headline}
    {byline}
    {pubDate}
  />
</div>

<div class="wide-container">
  <div class="filters">
    <label>
      Allegation Type
      <select bind:value={selectedAllegation}>
        <option>All Allegations</option>
        {#each allegationOptions as allegation (allegation)}
          <option>{allegation}</option>
        {/each}
      </select>
    </label>

    <label>
      Officer Command
      <select bind:value={selectedCommand}>
        <option>All Commands</option>
        {#each commandOptions as command (command)}
          <option>{command}</option>
        {/each}
      </select>
    </label>

    <label>
      Sort By
      <select bind:value={selectedSort}>
        <option>Date: Newest</option>
        <option>Date: Oldest</option>
        <option>Complaint ID: Desc</option>
        <option>Complaint ID: Asc</option>
      </select>
    </label>
  </div>

  <p class="results-count">Showing {sortedRecords.length} records</p>

  <div class="records">
    {#each sortedRecords as record (recordKey(record))}
      <button class="card" type="button" onclick={() => selected = record}>
        <h3>{record.fado_type ?? 'Unknown FADO type'}</h3>
        <p>{record.allegation ?? 'No allegation details'}</p>
      </button>
    {/each}
  </div>

{#if selected}
  <div class="modal" role="dialog" aria-modal="true" aria-label="Police record details">
    <button
      class="overlay"
      type="button"
      aria-label="Close details"
      onclick={() => selected = null}
    ></button>
    <div class="popup">
      <button class="close-btn" onclick={() => selected = null}>&times;</button>
      <h2>Complaint #{selected.complaint_id ?? 'N/A'}</h2>
      <p><strong>FADO Type:</strong> {selected.fado_type ?? 'N/A'}</p>
      <p><strong>Allegation:</strong> {selected.allegation ?? 'N/A'}</p>
      <p><strong>Officer Command:</strong> {selected.officer_command_at_incident ?? 'N/A'}</p>
      <p><strong>Investigator Recommendation:</strong> {selected.investigator_recommendation ?? 'N/A'}</p>
      <p><strong>CCRB Disposition:</strong> {selected.ccrb_allegation_disposition ?? 'N/A'}</p>
      <p><strong>As Of Date:</strong> {selected.as_of_date ?? 'N/A'}</p>
    </div>
  </div>
{/if}

</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  label {
    display: grid;
    gap: var(--spacing-xxs);
    font-weight: var(--font-weight-semibold);
  }

  select {
    font: inherit;
    padding: var(--spacing-xs);
    border: var(--border-width-thin) solid var(--color-border);
    background: var(--color-white);
  }

  .results-count {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-medium-gray);
  }

  .records {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-sm);
  }

  .card {
    width: 100%;
    text-align: left;
    background: var(--color-white);
    padding: var(--spacing-sm);
    border: var(--border-width-thin) solid var(--color-border);
    cursor: pointer;

    &:hover {
      background-color: var(--color-light-gray);
    }
  }

  .modal {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .overlay {
    position: fixed;
    inset: 0;
    border: none;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  .popup {
    position: relative;
    z-index: 1;
    background: white;
    padding: var(--spacing-lg);
    max-width: 500px;
    width: 90%;
  }

  .popup button {
    float: right;
    cursor: pointer;
  }

  .close-btn {
    position: absolute;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    background: none;
    border: none;
    font-size: var(--font-size-3xl);
    line-height: 1;
    color: var(--color-medium-gray);
    cursor: pointer;

    &:hover {
      color: var(--color-dark);
    }
  }
  
  .wide-container {
    max-width: 1300px;
    margin: var(--spacing-md) auto;
    padding: 0 var(--spacing-sm);
  }
  
</style>