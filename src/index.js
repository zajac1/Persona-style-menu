import clx from "classnames";
import entries from "./entries.json";
import { createStateSlice } from "./store";
import setup from "./dom-helpers";
import { createEventEmitter } from "./utils";
/**
 * [1] - This const defines curve lenght, so do we want to have menu curve
 * around a whole circle (360) or only part of it (defined in degrees).
 */

const CIRLCE_TOTAL_ANGLE = 180; // [1]
const ALLOWED_NAVIGATIONS_KEYS = ["ArrowUp", "ArrowDown", "Enter", "Escape"];

const { $, $$ } = setup();

const body = $("body");
const video = $("video");
const listContainer = $(".js-menu-list");
const audioPanelWrapper = $(".audio-panel-wrapper");
const volumeSlider = $(".volume-slider");
const audio = $(".audio-panel-wrapper audio");
const volumeIcon = $(".volume-icon");

const activeMenuItem = createStateSlice({
    key: "activeMenuItem",
    initialValue: null,
    additionalMethods: {
        makeEmpty: ({ set }) => () => set(null),
        isEqualTo: ({ get }) => (node) => {
            const currentMenuItem = get();
            if (!currentMenuItem) {
                return false;
            }

            return currentMenuItem.isSameNode(node);
        }
    }
});

const selectedIndex = createStateSlice({
    key: "selectedIndex",
    initialValue: null,
    additionalMethods: {
        checkIfEmpty: ({ get }) => () => get() === null,
        makeEmpty: ({ set }) => () => set(null)
    }
});

const colorActive = getComputedStyle(document.documentElement).getPropertyValue(
    "--color-active"
);

entries.forEach(({ text, subtext }, index) => {
    const svgIndex = index + 1;
    const randomSeed = Math.floor(Math.random() * 100) + 1;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
  <defs>
    <filter id="displacement-${svgIndex}" height="200%" width="200%" x="-50%" y="-50%">
      <feTurbulence baseFrequency="0.033" numOctaves="5" result="NOISE" seed="${randomSeed}"/>
      <feDisplacementMap in="SourceGraphic" in2="NOISE" scale="70" />
    </filter>
  </defs>
   
  <g filter="url(#displacement-${svgIndex})">
    <rect width="50%" height="15%" stroke="#333" stroke-width="2" fill="${colorActive}" />
  </g>
</svg>`;

    listContainer.innerHTML += `
    <li 
      class="menu-list-item menu-list-item--initial" 
      tabindex=${index} 
      data-index=${index}
      style="--index: ${index}"
      data-subtext="${subtext}"
      data-js="menu-item"
    >
      <div class="menu-list-item--content">${text}</div>
      <div 
        class="menu-list-item--background" 
        style='background-image: url("data:image/svg+xml, ${encodeURIComponent(
        svg
    )}")'>
      </div>
    </li>
  `;
});

const listItems = $$(".menu-list-item");

listItems.forEach((menuItem) => {
    const { index } = menuItem.dataset;
    menuItem.style.setProperty(
        "--angle",
        `${(CIRLCE_TOTAL_ANGLE / listItems.length) * index}deg`
    );
});

const [itemActivatedEvent, itemActivatedHandler] = createEventEmitter(
    "menu-item-activated",
    listContainer
);

const [itemDeactivatedEvent, itemDeactivatedHandler] = createEventEmitter(
    "menu-item-deactivated",
    listContainer
);

const [itemSelectedEvent, itemSelectedHandler] = createEventEmitter(
    "menu-item-selected",
    body
);

listContainer
    .on("click", ({ target }) => {
        const { dataset } = target;
        if (dataset.js === "menu-item") {
            const isMenuItemActivated = activeMenuItem.isEqualTo(target);
            const eventToDispatch = isMenuItemActivated
                ? itemDeactivatedEvent
                : itemActivatedEvent;

            if (!isMenuItemActivated) {
                activeMenuItem.set(target);
            }
            target.dispatchEvent(eventToDispatch);
            return;
        }
    })
    .on("mouseover", ({ target }) => {
        const { dataset } = target;
        if (dataset.js === "menu-item") {
            selectedIndex.set(Number(dataset.index));
            target.dispatchEvent(itemSelectedEvent);
        }
    });

audioPanelWrapper.on("click", ({ target }) => {
    const { dataset } = target;
    if (dataset.js === "sound-icon") {
        audioPanelWrapper.classList.toggle("audio-panel-wrapper--revelead");
        volumeSlider.classList.toggle("volume-slider--active");
        return;
    }

    if (!target.isEqualNode(volumeSlider)) {
        audioPanelWrapper.classList.remove("audio-panel-wrapper--revelead");
        volumeSlider.classList.remove("volume-slider--active");
    }
});

body.on("keydown", (event) => {
    const { code } = event;

    if (!ALLOWED_NAVIGATIONS_KEYS.includes(code)) {
        return;
    }

    if (code !== "Escape" && activeMenuItem.get()) {
        return;
    }

    if (code === "Escape" && !activeMenuItem.get()) {
        return;
    }

    if (code === "Escape") {
        const { target } = event;
        target.dispatchEvent(itemDeactivatedEvent);
        return;
    }


    if (code === "Enter") {
        const { target } = event;
        const isMenuItemActivated = activeMenuItem.isEqualTo(target);

        if (!isMenuItemActivated) {
            activeMenuItem.set(target);
            target.dispatchEvent(itemActivatedEvent);
        }
        return;
    }

    if (code === "ArrowDown") {
        if (selectedIndex.checkIfEmpty()) {
            selectedIndex.set(0);
        } else {
            selectedIndex.set((selectedIndex.get() + 1) % listItems.length);
        }
        event.target.dispatchEvent(itemSelectedEvent);
        return;
    }

    if (code === "ArrowUp") {
        if (selectedIndex.checkIfEmpty()) {
            selectedIndex.set(listItems.length - 1);
        } else {
            selectedIndex.set(
                (selectedIndex.get() - 1 + listItems.length) % listItems.length
            );
        }
        event.target.dispatchEvent(itemSelectedEvent);
        return;
    }
});

let hasAudioBeenInitialised = false;
volumeSlider.on("input", (e) => {
    const volumeValue = Number(e.currentTarget.value);
    if (!hasAudioBeenInitialised) {
        audio.play();
        hasAudioBeenInitialised = true;
    }
    audio.volume = volumeValue / 100;

    volumeIcon.className = clx("fa-solid", "volume-icon", {
        "fa-volume-xmark": volumeValue === 0,
        "fa-volume-low": volumeValue > 0 && volumeValue < 70,
        "fa-volume-high": volumeValue >= 70
    });
});

volumeIcon.on("click", () => {
    const currentVolumeValue = Number(volumeSlider.value);
    const isAudioMuted = currentVolumeValue === 0;

    volumeSlider.value = isAudioMuted ? 40 : 0;
    volumeSlider.dispatchEvent(new Event("input"));
});

itemActivatedHandler(() => {
    const activatedMenuItem = activeMenuItem.get();

    listItems.forEach((listElement) => {
        listElement.tabIndex = -1;
    });

    activatedMenuItem.tabIndex = 0;

    activatedMenuItem.classList.replace(
        "menu-list-item",
        "menu-list-item--selected"
    );
});

itemDeactivatedHandler(() => {
    const activatedMenuItem = activeMenuItem.get();
    activatedMenuItem.classList.replace(
        "menu-list-item--selected",
        "menu-list-item"
    );
    listItems.forEach((listElement, index) => {
        listElement.tabIndex = index;
    });
    activeMenuItem.makeEmpty();
});

itemSelectedHandler(() => {
    const itemIndex = selectedIndex.get();
    const menuSound = new Audio("src/assets/menu_item_choice.wav");
    menuSound.volume = 0.4;
    listItems[itemIndex].focus();
    menuSound.play();
});

video.on("timeupdate", function({ target }) {
    if (target.currentTime >= target.duration - 1) {
        target.currentTime = 1;
        target.play();
    }
});

document.fonts.onloadingdone = function(fontFaceSetEvent) {
    if (fontFaceSetEvent.fontfaces.length) {
        listItems.forEach((listElement) => {
            listElement.classList.remove("menu-list-item--initial");
        });
    }
};
