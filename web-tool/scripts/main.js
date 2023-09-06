import {} from "../constants/resources.js";

const addStudyCardButton = document.getElementById("add-study-card");
const currentCardButton = document.getElementById("active-card");
const decksContainer = document.getElementById("deck-container");
const decksContainerElements = [];
const deleteStudyCardButton = document.getElementById("delete-study-card");
const inputFile = document.getElementById("inputFile");
const nextCardButton = document.getElementById("next-card");
const previousCardButton = document.getElementById("previous-card");
const resetDecksButton = document.getElementById("reset");
const uploadButton = document.getElementById("uploadButton");
/* ========================================================================= 
    Const Data Types 
========================================================================= */

/**
 * @brief Describes the possible states of a flash card
 */
const CardState = {
  term: "term",
  definition: "definition",
  newCard: "new-card",
  empty: "empty",
};

/* ========================================================================= 
    Variable Definitions 
========================================================================= */

var allDecks = new Map();
var currentDeckKey = null;
var currentDeckValue = null;
var currentCardKey = null;
var currentCardValue = null;
var currentCardState = CardState.term;

/* ========================================================================= 
    Const Definitions 
========================================================================= */
const studyDeckKey = "Study Pile";

/* ========================================================================= 
    Function Definitions 
========================================================================= */

function resetPage() {
  // Reset JS
  allDecks = new Map();
  currentDeckKey = null;
  currentDeckValue = null;
  currentCardKey = null;
  currentCardValue = null;
  currentCardState = CardState.empty;

  // Reset HTML
  currentCardButton.textContent = "";
  decksContainerElements.forEach((deck) => {
    decksContainer.removeChild(deck);
  });
  decksContainerElements.length = 0;
}

async function handleFileAsync(e) {
  // Get File
  var file = null;
  file = e.target.files[0];
  if (!file) return;

  // Reset our enviornment now that we've gotten a new file to work with
  resetPage();

  // Load the file details
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      workbook.SheetNames.forEach(function (sheetName) {
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);
        let tempDeck = new Map();
        excelData.forEach((row) => {
          const key = row[Object.keys(row)[0]];
          const value = row[Object.keys(row)[1]];
          // Store all our key-value pairs in a local deck
          tempDeck.set(key, value);
        });

        allDecks.set(sheetName, tempDeck);
        addDeckIcon(sheetName);
      });

      currentDeckKey = allDecks.entries().next().value[0];
      currentDeckValue = allDecks.get(currentDeckKey);
      currentCardKey = currentDeckValue.entries().next().value[0];
      currentCardValue = currentDeckValue.get(currentCardKey);
      currentCardState = CardState.newCard;
      currentCardButton.textContent = `Click to begin studying ${currentDeckKey}`;
    } catch (error) {
      console.error("Error reading the file:", error);
    }

    localStorage.setItem("allDecks", JSON.stringify(allDecks));
  };

  // Read our excel file
  reader.readAsBinaryString(file);
}

async function updateCardState() {
  if (currentCardButton.textContent.trim() === "Please upload a file") {
    // Do nothing
  } else {
    switch (currentCardState) {
      case CardState.term:
        // We are currently displaying our term, update the display to the definition
        currentCardButton.textContent = currentCardValue;
        currentCardState = CardState.definition;
        break;
      case CardState.definition:
      case CardState.newCard:
        // We are currently displaying our definition, update the display to the ter
        currentCardButton.textContent = currentCardKey;
        currentCardState = CardState.term;
        break;
      case CardState.empty:
        currentCardButton.textContent = "";
        currentCardState = CardState.empty;
        break;
      default:
        currentCardButton.textContent =
          "Error (INVALID_STATE_ERROR). Please reload page";
    }
  }
}

function moveToNextCard() {
  const keys = Array.from(currentDeckValue.keys());

  if (currentCardKey == null) {
    currentCardKey = keys[0];
    currentCardValue = currentDeckValue.get(currentCardKey);
    console.log(currentCardValue);
    return;
  }

  const currentIndex = keys.indexOf(currentCardKey);
  if (currentIndex !== -1) {
    const nextIndex = (currentIndex + 1) % keys.length; // Wrap to the beginning if at the end
    currentCardKey = keys[nextIndex];
    currentCardValue = currentDeckValue.get(currentCardKey);
  }

  currentCardState = CardState.newCard;
  updateCardState();
}

// Function to move backward to the previous element in the map
function moveToPreviousCard() {
  const keys = Array.from(currentDeckValue.keys());

  if (currentCardKey === null) {
    currentCardKey = keys[(currentIndex + 1) % keys.length];
    currentCardValue = currentDeckValue.get(currentCardKey);
    return;
  }

  const currentIndex = keys.indexOf(currentCardKey);
  if (currentIndex !== -1) {
    const prevIndex = (currentIndex - 1 + keys.length) % keys.length; // Wrap to the end if at the beginning
    currentCardKey = keys[prevIndex];
    currentCardValue = currentDeckValue.get(currentCardKey);
  }

  currentCardState = CardState.newCard;
  updateCardState();
}

function addCardToStudyDeck() {
  if (!allDecks.has(studyDeckKey)) {
    allDecks.set(studyDeckKey, new Map());
  }
  if (!allDecks.get(studyDeckKey).has(currentCardKey)) {
    allDecks.get(studyDeckKey).set(currentCardKey, currentCardValue);
  }
  if (!document.getElementById(studyDeckKey)) {
    addDeckIcon(studyDeckKey);
  }

  moveToNextCard();
}

function removeCardFromStudyDeck() {
  if (allDecks.has(studyDeckKey)) {
    allDecks.get(studyDeckKey).delete(studyDeckKey);
    console.log("here");
  }
  moveToNextCard();
}

function addDeckIcon(deck) {
  const icon = document.createElement("button");
  icon.className = "deck-icon";
  icon.textContent = `${deck}`;
  icon.id = `${deck}`;

  // Link the element to and event listener
  icon.addEventListener("click", () => {
    currentDeckKey = icon.textContent;
    currentDeckValue = allDecks.get(currentDeckKey);
    currentCardKey = currentDeckValue.entries().next().value[0];
    currentCardValue = currentDeckValue.get(currentCardKey);
    currentCardButton.textContent = `Click to begin studying ${currentDeckKey}`;
    currentCardState = CardState.newCard;
  });

  decksContainer.appendChild(icon);
  decksContainerElements.push(icon);
}

/* ========================================================================= 
    Event Listeners 
========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  // New File Listeners
  inputFile.addEventListener("change", handleFileAsync, false);
  uploadButton.addEventListener("click", function () {
    inputFile.value = "";
    inputFile.click();
  });

  // Active Flash Card Listeners
  currentCardButton.addEventListener("click", updateCardState, false);
  nextCardButton.addEventListener("click", moveToNextCard);
  previousCardButton.addEventListener("click", moveToPreviousCard);
  addStudyCardButton.addEventListener("click", addCardToStudyDeck);
  deleteStudyCardButton.addEventListener("click", removeCardFromStudyDeck);
  //doneWithCardButton.addEventListener("click", addCardToDonePile);
  //resetDecksButton.addEventListener("click", resetDecks);
});
