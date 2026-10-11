// const { default: html2canvas } = require("html2canvas");

const printBtn = document.getElementById("printBtn");
const taskInput = document.querySelector("#task-input");
const psyduckScale = document.querySelectorAll(
  "input[name='stressed-psy-scale']",
);
const previewBtn = document.querySelector("#previewBtn");
const psyduckImgList = document.querySelectorAll(".urgency-scale-input img");
const previewBox = document.querySelector(".preview-box");
const taskText = document.querySelector(".task-text");
const taskScaleDiv = document.querySelector(".psyduck-urgency-scale");
const errorMsg = document.querySelector("#error");

taskInput.setAttribute("size", taskInput.getAttribute("placeholder").length);

psyduckScale.forEach((input) => {
  input.addEventListener("change", () => {
    const psyduckScaleChecked = document.querySelector(
      "input[name='stressed-psy-scale']:checked",
    );
    let currentValue = Number(psyduckScaleChecked.value) - 1;

    psyduckImgList.forEach((img, index) => {
      if (index <= currentValue) {
        img.classList.remove("opacity-filter");
      } else {
        img.classList.add("opacity-filter");
      }
    });
  });
});

function createTicket() {
  const frm = document.querySelector("form");
  const textInputContent = taskInput.value;
  const psyduckScaleChecked = document.querySelector(
    "input[name='stressed-psy-scale']:checked",
  );
  let psyduckNumber;

  if (!psyduckScaleChecked) {
    psyduckNumber = 1;
  } else {
    psyduckNumber = psyduckScaleChecked.value;
  }

  taskText.textContent = textInputContent;
  requestAnimationFrame(() => {
    let fontSize = 48;

    while (fontSize > 12) {
      taskText.style.fontSize = `${fontSize}px`;

      if (taskText.scrollWidth <= 384) {
        break;
      }

      fontSize -= 2;
    }
  });
  taskScaleDiv.replaceChildren();
  for (let i = 0; i < psyduckNumber; i++) {
    const psyduckImg = document.createElement("img");
    psyduckImg.src = "./assets/image/Psyduck.png";
    taskScaleDiv.appendChild(psyduckImg);
  }

  frm.reset();
  psyduckImgList.forEach((img) => {
    img.classList.add("opacity-filter");
  });
  previewBox.classList.remove("no-show");
}

previewBtn.addEventListener("click", (event) => {
  event.preventDefault();
  if (taskInput.value) {
    errorMsg.classList.add("full-opacity");
    createTicket();
  } else {
    errorMsg.classList.remove("full-opacity");
  }
});

printBtn.addEventListener("click", async () => {
  const newTicket = document.querySelector(".ticket-preview");
  const canvas = await html2canvas(newTicket, {scale:2});
  const imageTxt = canvas.toDataURL("image/png");
  const savedPath = await electronFunctions.saveImage(imageTxt);
  const result = await electronFunctions.printTicket(savedPath);

  if(!result){
    alert(`Couldn't print: ${result.error}`)
  }
});
