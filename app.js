const buttons = document.querySelectorAll('.button');
const numbers = document.querySelectorAll('.number');
const operators = document.querySelectorAll('.operator');
const functionBtn = document.querySelectorAll('.functionBtn');
const clearBtn = document.querySelector('.clear');
const deleteBtn = document.querySelector('.delete');
const equalBtn = document.querySelector('.equal-btn');
const percentBtn = document.querySelector('.percentage');
const display = document.querySelector('.value');
const displayExpression = document.querySelector('.current-expression');
const negativeBtn = document.querySelector('.flip-sign');
const operatorsRegex = /[x/+-]$/;
let mathExpression = '';
let currentOperator;
let lastNumber = '';
let lastBtn = '';
let negativeSign = true;
let percentageSign = true;
let negLastNum = new RegExp(/-{1}\d*(\.?)\d+$/); //breaks subtracting functionality including last # in regex
// let digits = new RegExp(/\d*(\.?)\d+$/); //need to retweak flipping nums
let digits = new RegExp(/-*\d*(\.?)\d*$/); //matches possible numbers with neg and decimals
let operatorsReg = new RegExp(/[+*/-]/gi);
let endsWithOperator = new RegExp(/[+*/-]\s*$/); //white space at end due to keeping spacing in mathexpression

function clear() {
  display.textContent = '';
  mathExpression = '';
  lastNumber = '';
  lastBtn = false;
  lastBtn = false;
  percentageSign = true;
}

//@# ===============  DELETE ONE FXN  =============
function deleteOne() {
  //Make del act like Clear if last button was equals
  if (lastBtn && lastBtn.classList.contains('equal-btn')) {
    return clear();
  }

  //For operators or numbers, delete last and update text and expression
  //todo: there is some wonkiness in here with the spacing for operators.  REally need to split this logic into slicing out numbers vs. slicing operators out.
  display.textContent = display.textContent.slice(
    0,
    display.textContent.length - 1
  );
  mathExpression = mathExpression.slice(0, mathExpression.length - 1);

  //updating last number based on whether operaand is at end
  if (lastBtn && lastBtn.classList.contains('number')) {
    if (display.textContent.match(endsWithOperator)) {
      lastNumber = display.textContent.match(/\d*(\.?)\d+/)[0];
    } else lastNumber = display.textContent.match(digits)[0];
  }
  lastBtn = this;
}

//@#===============  MANAGE NUMBERS  =============
function manageNumber() {
  let value = this.innerText;
  let dataValue = this.dataset.value;

  //clearning placeholder
  if (!lastBtn) {
    display.innerText = '';
  }

  //clear if last button was equal (i.e start over)
  if (lastBtn && lastBtn.classList.contains('equal-btn')) {
    clear();
  }
  display.textContent += value;
  mathExpression += dataValue;
  lastNumber = display.textContent.match(digits)[0]; //matching to end of last numbers

  lastBtn && lastBtn.classList.contains('flip-sign')
    ? negativeSign == false
    : negativeSign == true;
  lastBtn = this;
  checkfortooLong();
}

//@# ===============  MANAGE Operator  =============

function manageOperator() {
  //can't push and operator button first
  if (!lastBtn || display.textContent.length == 0) {
    return;
  }

  if (lastBtn.classList.contains('flip-sign') && !mathExpression.match(/\d$/)) {
    return; //don't want to do anything if negative was previous.
  }
  //replace previous operator
  if (mathExpression.match(endsWithOperator)) {
    mathExpression = mathExpression.substring(0, mathExpression.length - 2);
    display.textContent = display.textContent.substring(
      0,
      display.textContent.length - 2
    );
  }

  //@% Main 3 things to do when operan is pushed everytime
  mathExpression += ' ' + this.dataset.value + ' '; //spaces around operands
  display.textContent += ` ${this.textContent} `; //? why won't this put the spaces?
  currentOperator = this.dataset.value;

  negativeSign = true;
  lastBtn = this;
  checkfortooLong();
}

//@# ===============  MANAGE PERCENTS  =============
function percent() {
  //todo: this is a bit broken.  If you already have a decimal or are taking percents beyond .00 place, then it doesn't work right.  The replace function is limited to those places.

  if (lastBtn && lastBtn.classList.contains('number')) {
    let percentNumber = String(lastNumber * 0.01);
    display.textContent = display.textContent.replace(
      lastNumber,
      percentNumber
    );
    mathExpression = mathExpression.replace(lastNumber, percentNumber);
    lastNumber = percentNumber;
    percentageSign = false;
  }

  if (lastBtn && lastBtn.classList.contains('equal-btn')) {
    display.textContent = parse(display.textContent * 0.01);
    mathExpression = parse(mathExpression) * 0.01;
  }

  if (lastBtn == this) {
    if (percentageSign) {
      let percentNumber = String(lastNumber * 0.01);
      display.textContent = display.textContent.replace(
        lastNumber,
        percentNumber
      );
      mathExpression = mathExpression.replace(lastNumber, percentNumber);
      lastNumber = display.textContent.match(digits)[0];
      percentageSign = !percentageSign;
    } else {
      console.log(this);
      let nonPercentNumber = String(lastNumber * 100);
      display.textContent = display.textContent.replace(
        lastNumber,
        nonPercentNumber
      );
      mathExpression = mathExpression.replace(lastNumber, nonPercentNumber);
      lastNumber = display.textContent.match(digits)[0];
      percentageSign = !percentageSign;
    }
  }

  lastBtn = this;
}

//@# ===============  MANAGE EQUALS BUTTON  =============
//@! clicking the equals button
function evaluate(event) {
  if (lastBtn == this) {
    mathExpression = `${parse(
      mathExpression
    )} ${currentOperator} ${lastNumber}`; //the spaces in these template literals ensure that doing an operation such as 7 - -3 doesn't become 7--3 and break the parser
  }

  //calculate result
  display.textContent = parse(mathExpression);

  //Rounds decimals
  if (display.textContent.length >= 11 && display.textContent.includes('.')) {
    display.textContent = parse(mathExpression).toFixed(3);
  }
  negativeSign = true;
  lastBtn = this;
  checkfortooLong();
}

//?How does this work?  Used due to mdn saying never use eval
//?Got it  from this website:  Check here to remind yourself: https://dev.to/spukas/everything-wrong-with-javascript-eval-35on

//@# -------------- MANAGE PARSING -------------- */
function parse(str) {
  return Function(`return (${str})`)();
}

//@# ===============  Check for too long  =============
function checkfortooLong() {
  if (display.textContent.length > 25) {
    display.textContent = "Too many #'s for my little width";
  }
}

//@# this is called within flip sign whenever the mathexpression would match numbers at the end to invert them
function invertNumbers() {
  if (display.textContent.match(negLastNum)) {
    let index = display.textContent.lastIndexOf(lastNumber);
    let newNum = lastNumber.replace(`${lastNumber}`, `${Math.abs(lastNumber)}`);
    display.textContent = display.textContent
      .substring(0, index)
      .concat(newNum);
    mathExpression = mathExpression.substring(0, index).concat(newNum);
    lastNumber = newNum;
  } else if (!display.textContent.match(negLastNum)) {
    let index = display.textContent.lastIndexOf(lastNumber);
    let newNum = lastNumber.replace(lastNumber, `-${lastNumber}`);
    display.textContent = display.textContent
      .substring(0, index)
      .concat(newNum);
    mathExpression = mathExpression.substring(0, index).concat(newNum);
    lastNumber = newNum;
    negativeSign = !negativeSign;
  }
}

//@# ===============  inverse sign  =============
function flipSign() {
  if (!lastBtn) {
    display.textContent = '-';
    mathExpression += '-';
  }

  //@% managing operators
  if (lastBtn && lastBtn.classList.contains('operator')) {
    if (negativeSign) {
      display.textContent += '-';
      mathExpression += '-';
    } else if (!negativeSign) {
      display.textContent = display.textContent.replace('-', '');
      mathExpression.replace(' - ', '');
    }
    negativeSign = !negativeSign;
  }

  //handling numbers
  if (lastBtn && lastBtn.classList.contains('number')) {
    invertNumbers();
  }

  //@% handling this (+/-) as last inverse button
  if (lastBtn == this) {
    //this conditional handles things like  9 + -... then flipping that negative on and off
    if (mathExpression.match(endsWithOperator)) {
      let endIndex = mathExpression.length - 1;
      if (mathExpression.charAt(endIndex) == '-') {
        mathExpression = mathExpression.substring(0, endIndex);
        display.textContent = display.textContent.substring(0, endIndex);
        return;
      } else {
        mathExpression += '-';
        display.textContent += '-';
        return;
      }
    }
    invertNumbers();
  }

  //@% handling equal inverse
  if (lastBtn && lastBtn.classList.contains('equal-btn')) {
    if (parse(mathExpression) < 0) {
      display.textContent = display.textContent.substring(1);
    } else {
      display.textContent = display.textContent.replace(
        `${display.textContent}`,
        `-${display.textContent}`
      );
    }
    mathExpression = `${parse(mathExpression)}`;
    // negativeSign = !negativeSign;
    lastNumber = display.textContent;
  }

  //@$ if the last button was delete:
  if (lastBtn && lastBtn.classList.contains('delete')) {
    if (display.textContent.match(/[+*/-]$/i)) {
      display.textContent += '-';
      mathExpression += '-';
    } else {
      invertNumbers();
    }
  }

  if (lastBtn && lastBtn.classList.contains('percentage')) {
    invertNumbers();
  }

  //End of inverse button handling
  lastBtn = this;
}

//@# ===============  Event Listeners  =============   */
numbers.forEach((button) => button.addEventListener('click', manageNumber));
operators.forEach((operator) =>
  operator.addEventListener('click', manageOperator)
);
clearBtn.addEventListener('click', clear);
deleteBtn.addEventListener('click', deleteOne);
equalBtn.addEventListener('click', evaluate);
percentBtn.addEventListener('click', percent);
negativeBtn.addEventListener('click', flipSign);
