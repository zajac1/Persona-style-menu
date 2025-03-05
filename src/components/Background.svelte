<script>
  import Star from "./Star.svelte";
</script>

<svg
  width="100%"
  height="100%"
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
>
  <defs>
    <linearGradient
      id="backgroundGradient"
      x1="0%"
      y1="-20%"
      x2="100%"
      y2="-5%"
    >
      <stop offset="49.5%" stop-color="var(--color-background-left)" />
      <stop offset="49.6%" stop-color="var(--color-white)" />
      <stop offset="50%" stop-color="var(--color-white)" />
      <stop offset="50.1%" stop-color="var(--color-background-right)" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url('#backgroundGradient')" />
</svg>

<style>
  svg {
    position: absolute;
    height: 100%;
  }
</style>
