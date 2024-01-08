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

<ul class="menu-list js-menu-list">
  {#each entries as { text, subtext }, index}
    {@const svgIndex = index + 1}
    {@const svgDataURI = createBackgroundSvg(svgIndex)}
    {@const degreesPerItem = (CIRLCE_TOTAL_ANGLE / entries.length) * index}
    {@const currentItem = listItems[index]}

    <li
      bind:this={listItems[index]}
      class:menu-list-item={!currentItem?.isEqualNode(selectedItem)}
      class:menu-list-item--selected={currentItem?.isEqualNode(selectedItem)}
      class:menu-list-item--initial={!isInitialized}
      style:--index={index}
      style:--angle="{degreesPerItem}deg"
      data-subtext={subtext}
      tabindex={index}
      on:click={({ target }) => setSelectedItem(target)}
      on:mouseover={onActiveItemChange}
      on:focus={onFocus}
    >
      <div class="menu-list-item--content">{text}</div>
      <div
        class="menu-list-item--background"
        style:background-image="url('{svgDataURI}')"
      ></div>
    </li>
  {/each}
</ul>

<style>
  .menu-list {
    font-size: var(--menu-size);
    text-transform: uppercase;
    list-style-type: none;
    padding: 0;
    perspective: var(--perspective-depth);
    perspective-origin: center;
    margin-top: 45vh;
    margin-left: 20vw;
  }

  .menu-list-item {
    transform: rotateY(8deg) translateZ(var(--translation-z-axis))
      translateX(calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1));
    text-align: right;
    line-height: 65%;
    letter-spacing: -4px;
    cursor: pointer;
    color: var(--color-neutral-inverted);
    transition: transform cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
    position: relative;
  }

  .menu-list-item--initial {
    transform: rotateY(8deg) translateZ(var(--translation-z-axis))
      translateX(
        calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1 + 300px)
      );
  }

  .menu-list:has(.menu-list-item--selected)
    .menu-list-item:not(.menu-list-item--selected) {
    transition: all cubic-bezier(0.16, 1, 0.3, 1) 2s;
    transform: rotateY(8deg) translateZ(var(--translation-z-axis))
      translateX(
        calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1 - 900px)
      );
  }

  .menu-list-item:focus {
    position: relative;
    transform: rotateY(7deg) translateZ(calc(var(--translation-z-axis) + 3px))
      translateX(calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1));
    z-index: 1;
    animation: tiltAnimation 3s infinite linear;
  }

  .menu-list-item:focus-visible {
    outline: none;
  }

  .menu-list-item--content {
    width: min-content;
    margin-left: auto;
    pointer-events: none;
  }

  .menu-list-item:focus .menu-list-item--background,
  .menu-list-item--selected .menu-list-item--background {
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

  .menu-list-item:focus {
    animation: tiltAnimation 3s infinite linear;
    transform: rotateY(7deg) translateZ(calc(var(--translation-z-axis) + 3px))
      translateX(calc(var(--radius) + (var(--radius) * sin(var(--angle))) * -1));
    z-index: 1;
  }

  .menu-list-item:focus .menu-list-item--content,
  .menu-list-item--selected .menu-list-item--content {
    color: var(--color-neutral);
  }

  .menu-list-item--selected {
    transform: rotateY(0deg) translateX(15%)
      translateY(calc(var(--index) * -100% + 24px))
      translateZ(calc(var(--translation-z-axis) + 10px));
    position: relative;
    z-index: 1;
    animation: tiltAnimation 3s infinite linear;
    text-align: right;
    line-height: 65%;
    letter-spacing: -4px;
    transition: transform cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
    cursor: pointer;
    padding-left: 12px;
  }

  .menu-list-item--selected:focus-visible {
    outline: none;
  }
</style>
