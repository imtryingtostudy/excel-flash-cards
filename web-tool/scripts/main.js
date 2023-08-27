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
var myDeckCollection = {};

/**
 * @brief A deck holding all the flash cards flagged for restudying
 */
var myStudyPile = {};

/**
 * @brief A deck holding all the flash cards flagged as studied
 */
var myDonePile = {};

/**
 * @brief The current deck in the collection that is being studied by the user
 */
var myCurrentDeckKey = {};
var myCurrentDeck = {};

/**
 * @brief The current flash card (key-value pair) that is being studied by the user
 */
var myCurrentCardTerm = {};
var myCurrentCardDefinition = {};

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

    if (file) {
        console.log('Selected file: ', file);
    } else {
        console.log('No file selected.');
        return;
    }

    // Read file and get metrics
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheets = workbook.SheetNames

    numOfDecks = workbook.SheetNames.length;

    // Iterate over each of our decks (sheets) and parse the data
    for (var n = 0; n < sheets.length; n++) {
        const sheetName = workbook.SheetNames[n];
        const sheet = workbook.Sheets[sheetName];

        // Initialize arrays to store columns A (terms) and B (definitions) from the template
        let terms = [];
        let definitions = [];

        for (const cell in sheet) {
            if (cell[0] === 'A' && sheet.hasOwnProperty(cell)) {
                terms.push(sheet[cell].v);
            }
            if (cell[0] === 'B' && sheet.hasOwnProperty(cell)) {
                definitions.push(sheet[cell].v);
            }
        }

        // Verify that every term has a defintion and pair them
        let extractedCards = {};

        if (terms.length === definitions.length) {

            // Iterate through each column and create the key value pair relationship
            for (var i = 1; i < terms.length; i++) {
                // Insert each flash card pairing into our dictionary for this sheet
                extractedCards[terms[i]] = definitions[i];
            }
        } else {
            alert("Please check that every Term-Value pair is filled in")
        }

        // Store the current list of terms and defintiions in our collection
        myDeckCollection[sheetName] = extractedCards;
    }

    // Now that all the decks have been made, store the data in the users browser
    localStorage.setItem("decks", JSON.stringify(myDeckCollection));

    // Initialize our starting state
    initialize();
}

async function initialize() {
    // Populate our variables using the first deck in our collection as default
    console.log(myDeckCollection);
    myCurrentDeckKey = Object.keys(myDeckCollection)[0];
    myCurrentDeck = myDeckCollection[myCurrentDeckKey];
    myCurrentCardTerm = Object.keys(myCurrentDeck)[0];
    myCurrentCardDefinition = myCurrentDeck[myCurrentCardTerm];
    numOfDecks = Object.keys(myDeckCollection).length; // Deck Collection Size
    numOfCards = Object.keys(myCurrentDeck).length;

    // Store the card state
    myCardState = CardState.newCard;

    currentCardButton.textContent = "Click to begin studying [insert subject here]";
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
                currentCardButton.textContent = myCurrentCardDefinition;
                myCardState = CardState.definition;
                break;
            case CardState.definition:
            case CardState.newCard:
                currentCardButton.textContent = myCurrentCardTerm;
                myCardState = CardState.term;
                break;
            default:
                currentCardButton.textContent = "Error (INVALID_STATE_ERROR). Please reload page";
        }
    }
}

async function updateNextCard() {
    let keys = Object.keys(myCurrentDeck);
    let nextIndex = (keys.indexOf(myCurrentCardTerm) + 1) % numOfCards;
    let nextItem = keys[nextIndex];
    myCurrentCardTerm = nextItem;
    myCurrentCardDefinition = myCurrentDeck[myCurrentCardTerm];
    currentCardButton.textContent = myCurrentCardTerm;
    myCardState = CardState.newCard;
    updateCardState();
}

async function updatePreviousCard() {
    let keys = Object.keys(myCurrentDeck);
    let previousIndex = (keys.indexOf(myCurrentCardTerm) - 1) % numOfCards;
    let previousItem = keys[previousIndex];
    myCurrentCardTerm = previousItem
    myCurrentCardDefinition = myCurrentDeck[myCurrentCardTerm];
    currentCardButton.textContent = myCurrentCardTerm;
    myCardState = CardState.newCard;
    updateCardState();
}

async function addCardToStudyPile() {
    myStudyPile[myCurrentCardTerm] = myCurrentCardDefinition;
    delete myCurrentDeck[myCurrentCardTerm];
    console.log(numOfCards);
    numOfCards = Object.keys(myCurrentDeck).length;
    console.log(numOfCards);
    updateNextCard();
}

async function addCardToDonePile() {
    myDonePile[myCurrentCardTerm] = myCurrentCardDefinition;
    delete myCurrentDeck[myCurrentCardTerm];
    numOfCards = Object.keys(myCurrentDeck).length;
    updateNextCard();
}

async function resetDecks() {
    Object.assign(myCurrentDeck, myDonePile, myStudyPile);
    myDonePile = {};
    myStudyPile = {};
    myCurrentDeck = myDeckCollection[myCurrentDeckKey];
    myCurrentCardTerm = Object.keys(myCurrentDeck)[0];
    console.log(myCurrentDeck);
    updateNextCard();
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
    nextCardButton.addEventListener("click", updateNextCard);
    previousCardButton.addEventListener("click", updatePreviousCard);
    saveForLaterButton.addEventListener("click", addCardToStudyPile);
    doneWithCardButton.addEventListener("click", addCardToDonePile);
    resetDecksButton.addEventListener("click", resetDecks);
});


