<script>
  import FontAwesome from "svelte-fa";
  import {
    faVolumeXmark,
    faVolumeLow,
    faVolumeHigh,
  } from "@fortawesome/free-solid-svg-icons";
  const INITIAL_VOLUME_VALUE = 40;
  let audio;
  let volumeValue = 0;
  let hasAudioBeenInitialized = false;
  let icon;
  $: isAudioMuted = volumeValue === 0;
  $: if (audio) {
    audio.volume = volumeValue / 100;
  }
  $: {
    if (isAudioMuted) {
      icon = faVolumeXmark;
    }
    if (volumeValue > 0 && volumeValue < 70) {
      icon = faVolumeLow;
    }
    if (volumeValue > 70) {
      icon = faVolumeHigh;
    }
  }

  const toggleSound = () => {
    volumeValue = isAudioMuted ? INITIAL_VOLUME_VALUE : 0;
    if (!hasAudioBeenInitialized) {
      audio.play();
      hasAudioBeenInitialized = true;
    }
  };
</script>

<section class="audio-panel-wrapper">
  <audio bind:this={audio} loop>
    <source src="/src/assets/menu_music.mp3" />
  </audio>
  <button on:click={toggleSound}>
    <FontAwesome {icon} size="1.25x" />
  </button>
  <input
    type="range"
    min="0"
    max="100"
    bind:value={volumeValue}
    class="volume-slider"
    class:volume-slider--active={!isAudioMuted}
  />
</section>

<style>
  .audio-panel-wrapper {
    position: absolute;
    top: 12px;
    right: 12px;
    color: var(--color-neutral-inverted);
    font-size: 1.35em;
    display: flex;
    align-items: center;
    perspective: var(--perspective-depth);
    perspective-origin: center;
    transition: all cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
    gap: 4px;
  }

  button {
    border-radius: 50%;
    transition: background-color cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    -webkit-appearance: none;
    aspect-ratio: 1;

    &:hover {
      background-color: oklch(1 0 0 / 0.35);
      cursor: pointer;
    }
  }

  .volume-slider {
    -webkit-appearance: none;
    background: transparent;
    margin: 0;
    width: 0;
    transition: width cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
  }

  .volume-slider--active {
    width: 170px;
    height: 32px;
  }
  .volume-slider:focus {
    outline: none;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
  }

  .volume-slider--active::-webkit-slider-thumb {
    background-color: var(--color-neutral-inverted);
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }

  .volume-slider--active::-webkit-slider-runnable-track {
    background-color: var(--color-active);
    padding: 1px 0;
  }
</style>
