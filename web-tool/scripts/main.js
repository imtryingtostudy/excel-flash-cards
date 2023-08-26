import { read, writeFileXLSX } from "./dist/xlsx.mjs";

const userFile = document.getElementsByClassName("user-file")[0];

async function handleFileAsync(e) {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    /* data is an ArrayBuffer */
    const workbook = XLSX.read(data);

    // Store how many sheets (subjects/decks) are in the file
    const sheets = workbook.SheetNames

    var decks = {};
    // Iterate over all of our sheets
    for (var n = 0; n < sheets.length; n++) {
        var cards = {};

        // Grab the first sheet
        const sheetName = workbook.SheetNames[n];
        const sheet = workbook.Sheets[sheetName];

        // Initialize arrays to store column data
        var columnAData = [];
        var columnBData = [];

        // Iterate through the rows and extract data from columns A and B
        for (const cell in sheet) {
            if (cell[0] === 'A' && sheet.hasOwnProperty(cell)) {
                columnAData.push(sheet[cell].v);
            }
            if (cell[0] === 'B' && sheet.hasOwnProperty(cell)) {
                columnBData.push(sheet[cell].v);
            }
        }

        // Verify that we have an equal number of keys to values
        if (columnAData.length === columnBData.length) {
            for (var i = 1; i < columnAData.length; i++) {
                // Insert each flash card pairing into our dictionary for this sheet
                cards[columnAData[i]] = columnBData[i];
            }
        } else {
            alert("Please check that every Term-Value pair is filled in")
        }

        decks[sheetName] = cards;
    }

    localStorage.setItem("decks", JSON.stringify(decks));
    let print_deck = JSON.parse(localStorage.getItem("decks"));
    console.log(print_deck);
}

userFile.addEventListener("change", handleFileAsync, false);

