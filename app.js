//?? was going to try to reduce event listeners to one master logic flow handing out little functions, BUT I'm not sure if I can refactor that easily since my current functions depend so heavily on the this value of the element calling them.

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
let digits = new RegExp(/-*\d*(\.?)\d*$/); //matches possible numbers with neg and decimals
let operatorsReg = new RegExp(/[+*/-]/gi);
let endsWithOperator = new RegExp(/[+*/-]\s*$/); //white space at end due to keeping spacing around operands;

//! I was going to pass everything through a single event handler, BUT my functions are written to depend on the this value, and it doesn't seem that this passes through the call to next function being called here;
function handleButton(event) {
  switch (this.dataset.role) {
    case 'number':
      return manageNumber.apply(event.target);
    case 'operator':
      return manageOperator.apply(event.target);
    case 'clear':
      return clear.apply(event.target);
    case 'delete':
      return deleteOne.apply(event.target);
    case 'inverse':
      return flipSign.apply(event.target);
    case 'parse':
      return evaluate.apply(event.target);
    case 'percentage':
      return percent.apply(event.target);
    default:
      break;
  }
}

//@# =============== CLEAR FXN  =============
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
  if (lastBtn && lastBtn.dataset.role == 'parse') {
    return clear();
  }

  //@@ SLICE 3 FOR OPERATORS SINCE OPERATORS HAVE SPACES AROUND THEM
  if (lastBtn && lastBtn.dataset.role == 'operator') {
    display.textContent = display.textContent.slice(
      0,
      display.textContent.length - 3
    );
    mathExpression = mathExpression.slice(0, mathExpression.length - 3);
  }
  //@@ delete just one for numbers
  else if (lastBtn) {
    display.textContent = display.textContent.slice(
      0,
      display.textContent.length - 1
    );
    mathExpression = mathExpression.slice(0, mathExpression.length - 1);
  }

  //updating last number based on whether operand is at end
  if (lastBtn && lastBtn.dataset.role == 'number') {
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
  if (!lastBtn && value == 0) {
    return;
  }

  //clear if last button was equal (i.e start over)
  if (lastBtn && lastBtn.dataset.role == 'parse') {
    clear();
  }
  display.textContent += value;
  mathExpression += dataValue;
  lastNumber = display.textContent.match(digits)[0]; //matching to end of last numbers

  lastBtn && lastBtn.dataset.role == 'inverse'
    ? negativeSign == false
    : negativeSign == true;
  lastBtn = this;
  checkfortooLong();
}

//@# ===============  MANAGE Operator  =============

function manageOperator() {
  //can't push an operator button first
  if (!lastBtn || display.textContent.length == 0) {
    return;
  }

  if (lastBtn.dataset.role == 'inverse' && !mathExpression.match(/\d$/)) {
    return; //don't want to do anything if negative was previous.
  }
  //replace previous operator
  if (mathExpression.match(endsWithOperator)) {
    mathExpression = mathExpression.substring(0, mathExpression.length - 3);
    display.textContent = display.textContent.substring(
      0,
      display.textContent.length - 3
    );
  }

  //@% Main 3 things to do when operand is pushed everytime
  mathExpression += ' ' + this.dataset.value + ' '; //spaces around operands
  display.textContent += ` ${this.textContent} `;
  currentOperator = this.dataset.value;

  negativeSign = true;
  lastBtn = this;
  checkfortooLong();
}

//@# ===============  MANAGE PERCENTS  =============
function percent() {
  //todo: this is a bit broken.  If you already have a decimal or are taking percents beyond .00 place, then it doesn't work right.  The replace function is limited to those places.

  if (lastBtn && lastBtn.dataset.role == 'number') {
    let percentNumber = String(lastNumber * 0.01);
    display.textContent = display.textContent.replace(
      lastNumber,
      percentNumber
    );
    mathExpression = mathExpression.replace(lastNumber, percentNumber);
    lastNumber = percentNumber;
    percentageSign = false;
  }

  if (lastBtn && lastBtn.dataset.role == 'parse') {
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
function evaluate() {
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
  if (lastBtn && lastBtn.dataset.role == 'operator') {
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
  if (lastBtn && lastBtn.dataset.role == 'number') {
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
  if (lastBtn && lastBtn.dataset.role == 'parse') {
    if (parse(mathExpression) < 0) {
      display.textContent = display.textContent.substring(1);
    } else {
      display.textContent = display.textContent.replace(
        `${display.textContent}`,
        `-${display.textContent}`
      );
    }
    mathExpression = `${parse(mathExpression)}`;
    lastNumber = display.textContent;
  }

  //@$ if the last button was delete:
  if (lastBtn && lastBtn.dataset.role == 'delete') {
    if (display.textContent.match(/[+*/-]$/i)) {
      display.textContent += '-';
      mathExpression += '-';
    } else {
      invertNumbers();
    }
  }

  if (lastBtn && lastBtn.dataset.role == 'percentage') {
    invertNumbers();
  }

  //End of inverse button handling
  lastBtn = this;
}

//@# ===============  Event Listeners  =============   */

buttons.forEach((operator) => operator.addEventListener('click', handleButton));
