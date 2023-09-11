import { } from "../constants/resources.js";

// DOM Elements
const addStudyCardButton = document.getElementById("add-study-card");
const currentCardButton = document.getElementById("active-card");
const decksContainer = document.getElementById("deck-container");
const deleteStudyCardButton = document.getElementById("delete-study-card");
const inputFile = document.getElementById("inputFile");
const nextCardButton = document.getElementById("next-card");
const previousCardButton = document.getElementById("previous-card");
const resetDecksButton = document.getElementById("reset");
const uploadButton = document.getElementById("uploadButton");

// Constants
const CardState = {
  TERM: "term",
  DEFINITION: "definition",
  NEW_CARD: "new-card",
  EMPTY: "empty",
};

const DeckAction = {
  ADD_CARD: 0,
  REMOVE_CARD: 1,
  NEXT_CARD: 2,
  PREVIOUS_CARD: 3,
}

const STUDY_DECK_KEY = "Study Pile";

// State Variables
let allDecks = new Map();
let currentDeckKey = null;
let currentDeckValue = null;
let currentCardKey = null;
let currentCardValue = null;
let currentCardState = CardState.TERM;

// Array to store deck container elements
const decksContainerElements = [];

// Function to reset the page
function resetPage() {
  allDecks = new Map();
  currentDeckKey = null;
  currentDeckValue = null;
  currentCardKey = null;
  currentCardValue = null;
  currentCardState = CardState.EMPTY;

  currentCardButton.textContent = "";
  decksContainerElements.forEach((deck) => {
    decksContainer.removeChild(deck);
  });
  decksContainerElements.length = 0;
}

function initializePage(myDeckKey) {
  // Update our state to the first loaded deck and render as such
  currentDeckKey = myDeckKey;
  currentDeckValue = allDecks.get(currentDeckKey);
  currentCardKey = currentDeckValue.entries().next().value[0];
  currentCardValue = currentDeckValue.get(currentCardKey);
  currentCardState = CardState.NEW_CARD;
  currentCardButton.textContent = `Click to begin studying ${currentDeckKey}`;
}

function updateCardState() {
  console.log("h7");
  if (currentCardButton.textContent.trim() === "Please upload a file") {
    // Do nothing
  } else {
    switch (currentCardState) {
      case CardState.TERM:
        // We are currently displaying our term, update the display to the definition
        currentCardButton.textContent = currentCardValue;
        currentCardState = CardState.DEFINITION;
        break;
      case CardState.DEFINITION:
      case CardState.NEW_CARD:
        console.log("h8");
        // We are currently displaying our definition, update the display to the ter
        currentCardButton.textContent = currentCardKey;
        currentCardState = CardState.TERM;
        break;
      case CardState.EMPTY:
        currentCardButton.textContent = "";
        currentCardState = CardState.EMPTY;
        break;
      default:
        currentCardButton.textContent =
          "Error (INVALID_STATE_ERROR). Please reload page";
    }
  }
}

function updateDeck(deckKey, action) {
  switch (action) {
    case DeckAction.ADD_CARD:
      {
        if (deckKey != STUDY_DECK_KEY) {
          // Do not let the user add a card from their uploaded deck.
          // This should only be done in their excel sheet.
        } else {
          // Add deck to our collection of decks if it doesn't exist already
          if (!allDecks.has(STUDY_DECK_KEY)) {
            allDecks.set(STUDY_DECK_KEY, new Map());
            addDeckIcon(STUDY_DECK_KEY);
          }

          // Add our card to the deck if it doesnt exist already
          if (!allDecks.get(STUDY_DECK_KEY).has(currentCardKey)) {
            allDecks.get(STUDY_DECK_KEY).set(currentCardKey, currentCardValue);
          }
          updateDeck(STUDY_DECK_KEY, DeckAction.NEXT_CARD);
        }
        break;
      }
    case DeckAction.REMOVE_CARD:
      {
        console.log("h1");
        if (deckKey != STUDY_DECK_KEY) {
          // Do not let the user remove a card from their uploaded deck.
          // This should only be done in their excel sheet.
        } else {
          console.log("h2");
          // Remove card from the deck if it hasn't been already
          if (allDecks.has(STUDY_DECK_KEY)) {
            console.log("h3");
            const studyDeck = allDecks.get(STUDY_DECK_KEY);

            if (studyDeck.has(currentCardKey)) {
              console.log("h4");
              studyDeck.delete(currentCardKey);
              currentCardKey = null;
            }

            if (studyDeck.size == 0) {
              console.log("h5");
              removeDeckIcon(STUDY_DECK_KEY);
            }
          } else {
            console.error("We've attempted to remove the study deck when its already been removed, how'd we get here?");
          }
          updateDeck(STUDY_DECK_KEY, DeckAction.PREVIOUS_CARD);
        }
        break;
      }
    case DeckAction.NEXT_CARD:
      {
        let keys = Array.from(currentDeckValue.keys());
        if (currentCardKey == null) {
          currentCardKey = keys[0];
          currentCardValue = currentDeckValue.get(currentCardKey);
          console.log(currentCardValue);
          return;
        }

        let currentIndex = keys.indexOf(currentCardKey);
        if (currentIndex !== -1) {
          console.log("h6");
          const nextIndex = (currentIndex + 1) % keys.length; // Wrap to the beginning if at the end
          currentCardKey = keys[nextIndex];
          currentCardValue = currentDeckValue.get(currentCardKey);
        }

        currentCardState = CardState.NEW_CARD;
        updateCardState();
        break;
      }
    case DeckAction.PREVIOUS_CARD:
      {
        let keys = Array.from(currentDeckValue.keys());

        if (currentCardKey === null) {
          currentCardKey = keys[(currentIndex + 1) % keys.length];
          currentCardValue = currentDeckValue.get(currentCardKey);
          return;
        }

        let currentIndex = keys.indexOf(currentCardKey);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + keys.length) % keys.length; // Wrap to the end if at the beginning
          currentCardKey = keys[prevIndex];
          currentCardValue = currentDeckValue.get(currentCardKey);
        }

        currentCardState = CardState.NEW_CARD;
        updateCardState();
        break;
      }
    default:
      {
        console.error("Invalide action attempted: ", action);
        break;
      }
  }
}

function addDeckIcon(deckKey) {
  // Create our deck icon element
  const icon = document.createElement("button");
  icon.className = "deck-icon";
  icon.textContent = `${deckKey}`;
  icon.id = `${deckKey}`;

  // Link the element to and event listener
  icon.addEventListener("click", () => {
    initializePage(deckKey);
  });

  // Update our view
  decksContainer.appendChild(icon);
  decksContainerElements.push(icon);
}

function removeDeckIcon(deckKey) {
  if (allDecks.has(deckKey)) {
    // Find the deck icon element in the DOM using its unique ID (deckKey)
    const deckIconElement = document.getElementById(deckKey);

    if (deckIconElement) {
      // Remove the deck icon element from the DOM
      deckIconElement.parentNode.removeChild(deckIconElement);

      // Remove the deck from our map of decks
      allDecks.delete(deckKey);

      // Update the page to show our first deck
      initializePage(allDecks.entries().next().value[0]);

      // Remove the deck icon element from the decksContainerElements array
      const index = decksContainerElements.indexOf(deckIconElement);
      if (index !== -1) {
        decksContainerElements.splice(index, 1);
      }
    }
  }
}

// Function to handle file upload
async function handleFileAsync(e) {
  const file = e.target.files[0];
  if (!file) return;

  resetPage();

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        const tempDeck = new Map();

        excelData.forEach((row) => {
          const key = row[Object.keys(row)[0]];
          const value = row[Object.keys(row)[1]];
          tempDeck.set(key, value);
        });

        allDecks.set(sheetName, tempDeck);
        addDeckIcon(sheetName);
      });

      // Attempt to read the cards from the decks
      try {
        // Update the page do show our first deck
        initializePage(allDecks.entries().next().value[0]);
      } catch (error) {
        // Something went wrong. Likely some term-definition pair hasn't been filled out. 
        console.error("Error reading data from spreadsheet: \n", error);
      }

    } catch (error) {
      console.error("Error loading the file: \n", error);
    }

    localStorage.setItem("allDecks", JSON.stringify(allDecks));
  };

  reader.readAsBinaryString(file);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // File Upload Listeners
  inputFile.addEventListener("change", handleFileAsync, false);
  uploadButton.addEventListener("click", () => {
    inputFile.value = "";
    inputFile.click();
  });

  // Active Flash Card Listeners
  currentCardButton.addEventListener("click", updateCardState, false);
  nextCardButton.addEventListener("click", function () { updateDeck(currentCardKey, DeckAction.NEXT_CARD) }, false);
  previousCardButton.addEventListener("click", function () { updateDeck(currentCardKey, DeckAction.PREVIOUS_CARD) }, false);
  addStudyCardButton.addEventListener("click", function () { updateDeck(STUDY_DECK_KEY, DeckAction.ADD_CARD) });
  deleteStudyCardButton.addEventListener("click", function () { updateDeck(STUDY_DECK_KEY, DeckAction.REMOVE_CARD) });
});
