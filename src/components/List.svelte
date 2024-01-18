<script>
  import entries from "/src/entries.json";
  import { createBackgroundSvg, getItemInfo } from "/src/utils.js";

  const CIRLCE_TOTAL_ANGLE = 180; //  Defines the curve length for the menu. Choose between a full circle or a specific portion (defined in degrees).

  let listItems = [];
  let activeItem;

  const setActiveItem = (element) => (activeItem = element);
  const clearActiveItem = () => (activeItem = null);

  const onFocus = () => {
    const menuSound = new Audio("/src/assets/menu_item_choice.wav");
    menuSound.volume = 0.4;
    menuSound.play();
  };
  const onSelectedItemChange = ({ target }) => target.focus();

  const mapKeyToCallback = {
    Enter: ({ target }) => setActiveItem(target),
    Escape: clearActiveItem,
    ArrowDown: ({ target }) => {
      const { currentItemIndex, hasItemBeenFound } = getItemInfo({
        items: listItems,
        element: target,
      });
      const nextItem = hasItemBeenFound
        ? listItems[(currentItemIndex + 1) % listItems.length]
        : listItems.at(0);
      onSelectedItemChange({ target: nextItem });
    },
    ArrowUp: ({ target }) => {
      const { currentItemIndex, hasItemBeenFound } = getItemInfo({
        items: listItems,
        element: target,
      });
      const previousItem = hasItemBeenFound
        ? listItems[
            (currentItemIndex - 1 + listItems.length) % listItems.length
          ]
        : listItems.at(-1);
      onSelectedItemChange({ target: previousItem });
    },
  };

  export const onKeyPress = ({ code, target }, index) =>
    mapKeyToCallback[code]({ target, index });
  export const ALLOWED_NAVIGATION_KEYS = Object.keys(mapKeyToCallback);
  export let isInitialized;
</script>

<ul class="menu-list">
  {#each entries as { text, subtext }, index}
    {@const svgIndex = index + 1}
    {@const svgDataURI = createBackgroundSvg(svgIndex)}
    {@const degreesPerItem = (CIRLCE_TOTAL_ANGLE / entries.length) * index}
    {@const currentItem = listItems[index]}
    {@const isCurrentItemActive = currentItem?.isEqualNode(activeItem)}

    <li
      bind:this={listItems[index]}
      class={isCurrentItemActive ? "active" : "default"}
      class:initial={!isInitialized}
      style:--index={index}
      style:--angle="{degreesPerItem}deg"
      data-subtext={subtext}
      tabindex={index}
      on:click={isCurrentItemActive
        ? clearActiveItem
        : ({ target }) => setActiveItem(target)}
      on:mouseover={onSelectedItemChange}
      on:focus={onFocus}
    >
      <div class="content">
        <span>{text}</span>
        <div class="text-background" />
      </div>
      <div
        class="item-background"
        style:background-image="url('{svgDataURI}')"
      ></div>
    </li>
  {/each}
</ul>

<style>
  .menu-list {
    --default-rotation: 8deg;
    --default-delay: 20ms;
    --default-easing-function: cubic-bezier(0.16, 1, 0.3, 1);

    font-size: var(--menu-size);
    text-transform: uppercase;
    list-style-type: none;
    padding: 0;
    perspective: var(--perspective-depth);
    perspective-origin: center;
    margin-top: 45vh;
    margin-left: 20vw;
  }

  li {
    --default-horizontal-tilt: calc(
      var(--radius) + (var(--radius) * sin(var(--angle))) * -1
    );

    line-height: 65%;
    letter-spacing: -4px;
    text-align: right;
    cursor: pointer;
    position: relative;
    min-width: 250px;
    transition:
      transform var(--default-easing-function) 0.2s,
      translate var(--default-easing-function) 0.2s;
  }

  .default {
    rotate: y var(--default-rotation);
    translate: 0 0 var(--translation-z-axis);
    transform: translateX(var(--default-horizontal-tilt));
    color: var(--color-neutral-inverted);

    &:not(:focus) {
      transition-delay: calc(var(--index) * var(--default-delay)), 0ms; /* 0 so we won't delay translate animations */
    }

    &.initial {
      transform: translateX(calc(var(--default-horizontal-tilt) + 300px));
    }

    &:focus-visible {
      outline: none;
    }
  }

  .default:focus {
    animation: tiltSelected 4s infinite linear;
    rotate: y calc(var(--default-rotation) - 1deg);
    translate: 0 0 calc(var(--translation-z-axis) + 3px);
    transform: translateX(
      calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1)
    );
    z-index: 1;
  }

  .active {
    rotate: y 0deg;
    translate: -20% calc(var(--index) * -100% + 24px)
      calc(var(--translation-z-axis) + 10px);
    z-index: 1;
    animation: tiltActive 3s infinite linear;
    padding-left: 12px;

    &:focus-visible {
      outline: none;
    }
  }

  .content {
    width: min-content;
    margin-left: auto;
    pointer-events: none;
    position: relative;
    z-index: 1;
  }

  .text-background {
    display: none;
    background-color: var(--color-neutral-inverted);
    width: 95%;
    height: 0.5em;
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: -1;
  }

  .menu-list:has(.active) li:not(.active) {
    pointer-events: none; /* for a bug where after clicking accidentaly because of animation with hover we could invoke activate item*/
    transition:
      transform var(--default-easing-function) 2s,
      translate var(--default-easing-function) 2s;
    transform: translateX(
      calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1 - 900px)
    );
    transition-delay: calc(var(--index) * var(--default-delay));
  }

  li:focus .item-background,
  .active .item-background {
    background-repeat: no-repeat;
    background-size: cover;
    width: 215%;
    height: 280%;
    position: absolute;
    left: -5%;
    top: -70%;
    z-index: -1;
    pointer-events: none;
  }

  li:focus .text-background,
  .active .text-background {
    display: block;
  }

  li:focus .content,
  .active .content {
    color: var(--color-neutral);
    text-shadow:
      1px -1px 0 var(--color-neutral-inverted),
      -3px 1px 0 var(--color-neutral-inverted),
      3px 3px 0 var(--color-neutral-inverted),
      0 -3px 0 var(--color-neutral-inverted);
  }

  @keyframes tiltSelected {
    0%,
    100% {
      transform: translateX(calc(var(--default-horizontal-tilt) + 3px))
        translateY(0);
    }
    25% {
      transform: translateX(var(--default-horizontal-tilt)) translateY(3px);
    }
    50% {
      transform: translateX(calc(var(--default-horizontal-tilt) - 3px))
        translateY(0);
    }
    75% {
      transform: translateX(var(--default-horizontal-tilt)) translateY(-3px);
    }
  }

  @keyframes tiltActive {
    0%,
    100% {
      transform: translateX(3px) translateY(0);
    }
    25% {
      transform: translateX(0) translateY(3px);
    }
    50% {
      transform: translateX(-3px) translateY(0);
    }
    75% {
      transform: translateX(0) translateY(-3px);
    }
  }
</style>
