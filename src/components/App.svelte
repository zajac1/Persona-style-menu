<script>
  import AudioPlayer from "./AudioPlayer.svelte";
  import List from "./List.svelte";
  let isInitialized = false;
  let listElement;

  document.fonts.onloadingdone = ({ fontfaces }) => {
    isInitialized = Boolean(fontfaces.length);
  };
</script>

<svelte:body
  on:keydown={(event) => {
    if (listElement.ALLOWED_NAVIGATION_KEYS.includes(event.key)) {
      listElement.onKeyPress(event);
    }
  }}
/>
<AudioPlayer />
<List bind:this={listElement} {isInitialized} />
