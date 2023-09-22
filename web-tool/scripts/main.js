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
};

const STUDY_DECK_KEY = "Study Pile";

// State Variables
let allDecks = new Map();
let myCurrentDeckName = "";
let myCurrentDeckFlashCards = new Array();
let myCurrentFlashCardIndex = 0;
let myCurrentFlashCardTerm = "";
let myCurrentFlashCardDefinition = "";
let currentCardState = CardState.TERM;
let isStudying = false;

// Array to store deck container elements
const decksContainerElements = [];

// Function to reset the page
function resetPage() {
  allDecks = new Map();
  myCurrentDeckName = null;
  myCurrentDeckFlashCards = null;
  myCurrentFlashCardTerm = null;
  myCurrentFlashCardDefinition = null;
  currentCardState = CardState.EMPTY;

  currentCardButton.textContent = "";
  decksContainerElements.forEach((deck) => {
    decksContainer.removeChild(deck);
  });
  decksContainerElements.length = 0;
}

function initializePage(myDeckKey) {
  // Update our state to the first loaded deck and render as such
  myCurrentDeckName = myDeckKey;
  myCurrentDeckFlashCards = allDecks.get(myCurrentDeckName);
  myCurrentFlashCardIndex = 0;
  myCurrentFlashCardTerm = myCurrentDeckFlashCards[myCurrentFlashCardIndex][0];
  myCurrentFlashCardDefinition = myCurrentDeckFlashCards[myCurrentFlashCardIndex][1];
  currentCardState = CardState.NEW_CARD;
  currentCardButton.textContent = `Click to begin studying ${myCurrentDeckName}`;
}

function updateCardState() {
  if (currentCardButton.textContent.trim() === "Please upload a file") {
    // Do nothing
  } else {
    switch (currentCardState) {
      case CardState.TERM:
        // We are currently displaying our term, update the display to the definition
        currentCardButton.textContent = myCurrentFlashCardDefinition;
        currentCardState = CardState.DEFINITION;
        break;
      case CardState.DEFINITION:
      case CardState.NEW_CARD:
        // We are currently displaying our definition, update the display to the ter
        currentCardButton.textContent = myCurrentFlashCardTerm;
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
    case DeckAction.ADD_CARD: {
      if (deckKey != STUDY_DECK_KEY) {
        // Users can only add cards to the study deck
      } else {
        if (!allDecks.has(STUDY_DECK_KEY)) {
          // Create the study deck if it hasn't already been made
          allDecks.set(STUDY_DECK_KEY, new Array());
          addDeckIcon(STUDY_DECK_KEY);
        }

        let studyDeck = allDecks.get(STUDY_DECK_KEY);
        if (!studyDeck.includes(myCurrentFlashCardTerm)) {
          // Add the card to our deck 
          studyDeck.push([myCurrentFlashCardTerm, myCurrentFlashCardDefinition]);
        }

        // Move on to our next card
        updateDeck(STUDY_DECK_KEY, DeckAction.NEXT_CARD);
      }
      break;
    }
    case DeckAction.REMOVE_CARD: {
      if (currentCardButton.textContent === `Click to begin studying ${myCurrentDeckName}` || currentCardButton.textContent === `Please upload a file`) {
        console.error(
          "Cannot remove card until user has begun studying"
        );
        return;
      } else if (deckKey != STUDY_DECK_KEY) {
        console.error(
          "Cannot remove card from a non study deck."
        );
        return;
      } else if (!allDecks.has(STUDY_DECK_KEY)) {
        console.error(
          "Removing a card from any deck that is not the study deck is prohibited. To update your decks, reupload a new excel file with your edits"
        );
        return;
      } else {
        let studyDeck = allDecks.get(STUDY_DECK_KEY);
        // Remove the current active card from the study deck
        studyDeck.splice(myCurrentFlashCardIndex, 1);

        if (studyDeck.length === 0) {
          console.log(studyDeck.length);
          // If we've removed all the cards from the study deck, we can delete the deck
          removeDeckIcon(STUDY_DECK_KEY);
          // We also want to return back to our first deck instead of onto the previous card
          initializePage(allDecks.entries().next().value[0])
          break;
        }

        // Move to our previous card
        updateDeck(STUDY_DECK_KEY, DeckAction.PREVIOUS_CARD);
      }
      break;
    }
    case DeckAction.NEXT_CARD: {
      if (myCurrentFlashCardTerm === null) {
        myCurrentFlashCardIndex = 0;
      }

      if (myCurrentFlashCardIndex !== -1) {
        myCurrentFlashCardIndex = (myCurrentFlashCardIndex + 1) % myCurrentDeckFlashCards.length; // Wrap to the beginning if at the end
        myCurrentFlashCardTerm = myCurrentDeckFlashCards[myCurrentFlashCardIndex][0];
        myCurrentFlashCardDefinition = myCurrentDeckFlashCards[myCurrentFlashCardIndex][1];
      }

      currentCardState = CardState.NEW_CARD;
      updateCardState();
      break;
    }
    case DeckAction.PREVIOUS_CARD: {
      if (myCurrentFlashCardTerm === null) {
        myCurrentFlashCardIndex = 0;
      }

      if (myCurrentFlashCardIndex !== -1) {
        myCurrentFlashCardIndex = (myCurrentFlashCardIndex - 1 + myCurrentDeckFlashCards.length) % myCurrentDeckFlashCards.length; // Wrap to the end if at the beginning
        myCurrentFlashCardTerm = myCurrentDeckFlashCards[myCurrentFlashCardIndex][0];
        myCurrentFlashCardDefinition = myCurrentDeckFlashCards[myCurrentFlashCardIndex][1];
      }

      currentCardState = CardState.NEW_CARD;
      updateCardState();
      break;
    }
    default: {
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
        const tempDeck = new Array();

        excelData.forEach((row) => {
          const key = row[Object.keys(row)[0]];
          const value = row[Object.keys(row)[1]];
          tempDeck.push([key, value]);
        });

        allDecks.set(sheetName, tempDeck);
        addDeckIcon(sheetName);
      });

      console.log(allDecks);
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
  nextCardButton.addEventListener(
    "click",
    function () {
      updateDeck(myCurrentFlashCardTerm, DeckAction.NEXT_CARD);
    },
    false
  );
  previousCardButton.addEventListener(
    "click",
    function () {
      updateDeck(myCurrentFlashCardTerm, DeckAction.PREVIOUS_CARD);
    },
    false
  );
  addStudyCardButton.addEventListener("click", function () {
    updateDeck(STUDY_DECK_KEY, DeckAction.ADD_CARD);
  });
  deleteStudyCardButton.addEventListener("click", function () {
    updateDeck(STUDY_DECK_KEY, DeckAction.REMOVE_CARD);
  });
});
