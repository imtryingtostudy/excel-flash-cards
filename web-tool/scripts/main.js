// const myImage = document.querySelector("img");

// myImage.onclick = () => {
//     const mySrc = myImage.getAttribute("src");
//     if (mySrc === "images/hello.jpg") {
//         myImage.setAttribute("src", "images/goodbye.png");
//     } else {
//         myImage.setAttribute("src", "images/hello.jpg");
//     }
// };

// let myButton = document.querySelector("button");
// myButton.onclick = () => {
//     setUserName();
// };

// let myHeading = document.querySelector("h1");

// function setUserName() {
//     const myName = prompt("Please enter your name.");
//     if (!myName) {
//       setUserName();
//     } else {
//       localStorage.setItem("name", myName);
//       myHeading.textContent = `Mozilla is cool, ${myName}`;
//     }
//   }

// if (!localStorage.getItem("name")) {
//     setUserName();
// } else {
//     const storedName = localStorage.getItem("name");
//     myHeading.textContent = `Mozilla is cool, ${storedName}`;
// }

import utils from "xlsx";
import { WorkBook } from "xlsx";

const notecard = {
    'TERM': 'term',
    'DEFINITION': 'definition'
}

async function handleFileAsync(e) {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    /* data is an ArrayBuffer */
    const workbook = XLSX.read(data);

    /* DO SOMETHING WITH workbook HERE */
}

user_flash_cards_sheet.addEventListener("change", handleFileAsync, false);
