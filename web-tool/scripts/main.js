import { read, writeFileXLSX } from "./dist/xlsx.mjs";
import { } from '../constants/resources.js'

const currentCardButton = document.getElementById('active-card');
const doneWithCardButton = document.getElementById('done-with-card');
const inputFile = document.getElementById('inputFile');
const nextCardButton = document.getElementById('next-card');
const previousCardButton = document.getElementById('previous-card');
const resetDecksButton = document.getElementById('reset');
const saveForLaterButton = document.getElementById('save-for-later');
const uploadButton = document.getElementById('uploadButton');

/* ========================================================================= 
    Const Data Types 
========================================================================= */

/**
 * @brief Describes the possible states of a flash card
 */
const CardState = {
    term: 'term',
    definition: 'definition',
    newCard: 'new-card',
};

/* ========================================================================= 
    Variable Definitions 
========================================================================= */

/**
 * @brief A collection of all decks (sheets) read from the provided user file
 */
var myDeckCollection = new Map();

/**
 * @brief A deck holding all the flash cards flagged for restudying
 */
var myStudyPile = new Map();

/**
 * @brief A deck holding all the flash cards flagged as studied
 */
var myDonePile = new Map();

/**
 * @brief The current deck in the collection that is being studied by the user
 */
var myCurrentDeck = new Map();
var currentCardValue = null;
var currentCardKey = null;

/**
 * @brief The current number of decks in @myDeckCollection
 */
var numOfDecks = 0;

/**
 * @brief The current number of cards in @myCurrentDeck
 */
var numOfCards = 0;

/**
 * @brief The current active face of @myCurrentCard
 */
var myCardState = CardState.term;

/* ========================================================================= 
    Function Definitions 
========================================================================= */

/**
 * @brief Populates our collection information and sets the starting state
 * @param {*} e 
 */
async function handleFileAsync(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });

            workbook.SheetNames.forEach(function (sheetName) {
                const worksheet = workbook.Sheets[sheetName];
                const excelData = XLSX.utils.sheet_to_json(worksheet);
                let deck = new Map();
                excelData.forEach(row => {
                    const key = row[Object.keys(row)[0]];
                    const value = row[Object.keys(row)[1]];
                    // Store all our key-value pairs in a local deck 
                    deck.set(key, value);
                })
                // Store our deck with our subject (sheet) name in our deck collection
                myDeckCollection.set(sheetName, deck);
            });
            console.log(myDeckCollection);
        } catch (error) {
            console.error("Error reading the file:", error);
        }

        // Now that all the decks have been made, store the data in the users browser
        localStorage.setItem("decks", JSON.stringify(myDeckCollection));

        // Initialize our starting state
        initialize();
    };

    // Read our excel file
    reader.readAsBinaryString(file);
}

function initialize() {
    let myCurrentDeckKey = myDeckCollection.entries().next().value[0]; // Subject 1
    myCurrentDeck = myDeckCollection.entries().next().value[1]; // Deck 1

    // Store the card state and change signifer text
    myCardState = CardState.newCard;
    currentCardButton.textContent = "Click to begin studying [insert subject here]";
    moveToNextCard();
}

async function initializeNewDeck() {
    // TODO
}

async function updateCardState() {
    if (currentCardButton.textContent.trim() === "Please upload a file") {
        // Do nothing
    } else {
        switch (myCardState) {
            case CardState.term:
                // We are currently displaying our term, update the display to the definition
                currentCardButton.textContent = currentCardValue;
                myCardState = CardState.definition;
                break;
            case CardState.definition:
            case CardState.newCard:
                // We are currently displaying our definition, update the display to the ter
                currentCardButton.textContent = currentCardKey;
                myCardState = CardState.term;
                break;
            default:
                currentCardButton.textContent = "Error (INVALID_STATE_ERROR). Please reload page";
        }
    }
}

function moveToNextCard() {
    const keys = Array.from(myCurrentDeck.keys());

    if (currentCardKey === null) {
        currentCardKey = keys[0];
        currentCardValue = myCurrentDeck.get(currentCardKey);
        console.log(currentCardValue);
        return;
    }

    const currentIndex = keys.indexOf(currentCardKey);
    if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % keys.length; // Wrap to the beginning if at the end
        currentCardKey = keys[nextIndex];
        currentCardValue = myCurrentDeck.get(currentCardKey);
    }

    myCardState = CardState.newCard;
    updateCardState();
}

// Function to move backward to the previous element in the map
function moveToPreviousCard() {
    const keys = Array.from(myCurrentDeck.keys());

    if (currentCardKey === null) {
        currentCardKey = keys[(currentIndex + 1) % keys.length];
        currentCardValue = myCurrentDeck.get(currentCardKey);
        return;
    }

    const currentIndex = keys.indexOf(currentCardKey);
    if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + keys.length) % keys.length; // Wrap to the end if at the beginning
        currentCardKey = keys[prevIndex];
        currentCardValue = myCurrentDeck.get(currentCardKey);
    }

    myCardState = CardState.newCard;
    updateCardState();
}


async function addCardToStudyPile() {

}

async function addCardToDonePile() {

}

async function resetDecks() {

}

/* ========================================================================= 
    Event Listeners 
========================================================================= */
document.addEventListener('DOMContentLoaded', function () {

    // New File Listeners
    inputFile.addEventListener('change', handleFileAsync, false);
    uploadButton.addEventListener('click', function () {
        inputFile.click();
    });

    // Active Flash Card Listeners
    currentCardButton.addEventListener("click", updateCardState, false);
    nextCardButton.addEventListener("click", moveToNextCard);
    previousCardButton.addEventListener("click", moveToPreviousCard);
    saveForLaterButton.addEventListener("click", addCardToStudyPile);
    doneWithCardButton.addEventListener("click", addCardToDonePile);
    resetDecksButton.addEventListener("click", resetDecks);
});


