<script>
  import entries from "/src/entries.json";
  import { createBackgroundSvg, getItemInfo } from "/src/utils.js";

  const CIRLCE_TOTAL_ANGLE = 180; //  Defines the curve length for the menu. Choose between a full circle or a specific portion (defined in degrees).

  let listItems = [];
  let selectedItem;

  const setSelectedItem = (element) => (selectedItem = element);
  const resetSelectedItem = () => (selectedItem = null);

  const onFocus = () => {
    const menuSound = new Audio("/src/assets/menu_item_choice.wav");
    menuSound.volume = 0.4;
    menuSound.play();
  };
  const onActiveItemChange = ({ target }) => target.focus();

  const mapKeyToCallback = {
    Enter: ({ target }) => setSelectedItem(target),
    Escape: resetSelectedItem,
    ArrowDown: ({ target }) => {
      const { currentItemIndex, hasItemBeenFound } = getItemInfo({
        items: listItems,
        element: target,
      });
      const nextItem = hasItemBeenFound
        ? listItems[(currentItemIndex + 1) % listItems.length]
        : listItems.at(0);
      onActiveItemChange({ target: nextItem });
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
      onActiveItemChange({ target: previousItem });
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

    <li
      bind:this={listItems[index]}
      class:item={!currentItem?.isEqualNode(selectedItem)}
      class:item-selected={currentItem?.isEqualNode(selectedItem)}
      class:item-initial={!isInitialized}
      style:--index={index}
      style:--angle="{degreesPerItem}deg"
      data-subtext={subtext}
      tabindex={index}
      on:click={({ target }) => setSelectedItem(target)}
      on:mouseover={onActiveItemChange}
      on:focus={onFocus}
    >
      <div class="item--content">{text}</div>
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


  .item {
    --default-horizontal-tilt: calc(
      var(--radius) + (var(--radius) * sin(var(--angle))) * -1
    );

    rotate: y var(--default-rotation);
    translate: 0 0 var(--translation-z-axis);
    transform: translateX(
      calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1)
    );
    text-align: right;
    line-height: 65%;
    letter-spacing: -4px;
    cursor: pointer;
    color: var(--color-neutral-inverted);
    transition: all var(--default-easing-function) 0.2s;
    position: relative;
    min-width: 250px;
  }

  .item-initial {
    transform: translateX(
      calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1 + 300px)
    );
  }

  .item-selected {
    rotate: y 0deg;
    translate: -20% calc(var(--index) * -100% + 24px)
      calc(var(--translation-z-axis) + 10px);
    position: relative;
    z-index: 1;
    animation: tiltSelected 3s infinite linear;
    text-align: right;
    line-height: 65%;
    letter-spacing: -4px;
    transition: all var(--default-easing-function) 0.2s;
    cursor: pointer;
    padding-left: 12px;
  }

  .menu-list:has(.item-selected) .item:not(.item-selected) {
    pointer-events: none; /* for a bug where after clicking accidentaly because of animation with hover we could invoke activate item*/
    transition: all var(--default-easing-function) 2s;
    transform: translateX(
      calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1 - 900px)
    );
  }

  .item:focus-visible {
    outline: none;
  }

  .item--content {
    width: min-content;
    margin-left: auto;
    pointer-events: none;
  }

  .item:focus .item-background,
  .item-selected .item-background {
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

  .item:focus {
    animation: tiltActive 4s infinite linear;
    rotate: y calc(var(--default-rotation) - 1deg);
    translate: 0 0 calc(var(--translation-z-axis) + 3px);
    transform: translateX(
      calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1)
    );
    z-index: 1;
  }

  .item:focus .item--content,
  .item-selected .item--content {
    color: var(--color-neutral);
    text-shadow:
      1px -1px 0 var(--color-neutral-inverted),
      -3px 1px 0 var(--color-neutral-inverted),
      3px 3px 0 var(--color-neutral-inverted),
      0 -3px 0 var(--color-neutral-inverted);
  }

  .item-selected:focus-visible {
    outline: none;
  }

  @keyframes tiltActive {
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

  @keyframes tiltSelected {
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
