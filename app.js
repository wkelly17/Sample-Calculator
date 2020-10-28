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
let digits = new RegExp(/-*\d*(\.?)\d+$/); //original digits
let operatorsReg = new RegExp(/[+*/-]/gi);
// console.log(buttons);

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
  display.textContent = display.textContent.slice(
    0,
    display.textContent.length - 1
  );
  mathExpression = mathExpression.slice(0, mathExpression.length - 1); //? not sure why white space works for operands but not textcontent

  //updating last number based on whether operaand is at end
  if (lastBtn && lastBtn.classList.contains('number')) {
    if (display.textContent.match(/[+*/-]$/i)) {
      lastNumber = display.textContent.match(/\d*(\.?)\d+/)[0];
    } else lastNumber = display.textContent.match(digits)[0];
  }
  lastBtn = this;
}

//@#===============  manage Numbers  =============
function manageNumber() {
  let value = this.innerText;
  let dataValue = this.dataset.value;

  console.log(value);
  if (!lastBtn) {
    display.innerText = '';
    // displayExpression.innerText = '';
  }
  if (lastBtn && lastBtn.classList.contains('equal-btn')) {
    clear();
  }
  // if (lastBtn && lastBtn.classList.contains('number')) {
  if (display.textContent.match(digits)) {
    //Better method of determining last number
    // lastNumber += value;

    //!must add input since match returns an object
    display.textContent += value;
    // displayExpression.innerText += value;
    mathExpression += dataValue;
  } else {
    // lastNumber = value;
    display.textContent += value;
    // displayExpression.innerText = value;
    mathExpression += dataValue;
  }

  lastNumber = display.textContent.match(digits)[0];
  //check for previous negative button for last number
  // if (lastBtn && lastBtn.classList.contains('flip-sign')) {
  //   lastNumber = `-${lastNumber}`;
  /* else if (!negativeSign) {
      lastNumber = lastNumber.replace(`- ${lastNumber}`, value);
    } */
  // }

  lastBtn && lastBtn.classList.contains('flip-sign')
    ? negativeSign == false
    : negativeSign == true;
  lastBtn = this;
  checkfortooLong();
}

//@# ===============  manage Operator  =============
function manageOperator(event) {
  console.log(this.dataset.value);
  if (!lastBtn || display.textContent.length == 0) {
    return;
  }
  //todo: Flawed. Need to fix. 6 + 99 del + x renders an error.  Need to eval action based upon last char in textcontent (see regex matching above in delete fxn for help how)
  if (
    (lastBtn && lastBtn.classList.contains('operator')) ||
    (lastBtn &&
      lastBtn.classList.contains('delete') &&
      !display.textContent.match(digits))
  ) {
    mathExpression = mathExpression.substring(0, mathExpression.length - 2);
    display.textContent = display.textContent.substring(
      0,
      display.textContent.length - 2
    );
  }
  mathExpression += ' ' + this.dataset.value + ' '; //spaces around operands
  display.textContent += ` ${this.textContent} `; //? why won't this put the spaces?
  currentOperator = this.dataset.value;

  // // lastBtn && lastBtn.classList.contains('flip-sign')
  //   ? negativeSign == true
  //   : negativeSign == false;

  negativeSign = true;
  lastBtn = this;
  checkfortooLong();
}

//@# ===============  manage percents  =============
function percent() {
  console.log(this);
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

//@# ===============  manage equals button  =============
//@! clicking the equals button
function evaluate(event) {
  if (lastBtn == this) {
    mathExpression = `${parse(
      mathExpression
    )} ${currentOperator} ${lastNumber}`;
  }
  display.textContent = parse(mathExpression);
  negativeSign = true;

  //@ Can just truncate display to keep everything beneath a certain text size.
  checkfortooLong();
  //Rounds decimals
  if (display.textContent.length >= 11 && display.textContent.includes('.')) {
    display.textContent = parse(mathExpression).toFixed(3);
  }
  negativeSign = true;
  lastBtn = this;
}

//?How does this work?  Used due to mdn saying never use eval
//?Got it  from this website:  Check here to remind yourself: https://dev.to/spukas/everything-wrong-with-javascript-eval-35on
function parse(str) {
  return Function(`return (${str})`)();
}

//@# ===============  Check for too long  =============
function checkfortooLong() {
  if (display.textContent.length > 50) {
    display.textContent = "Too many #'s for my little width";
  }
}

//@? I used this version when I wasn't defining last num with neg in it.  The problem is the regex is matching the minus sign.
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
    // mathExpression = mathExpression.replace(lastNumber, newNum);
    mathExpression = mathExpression.substring(0, index).concat(newNum);
    lastNumber = newNum;
    negativeSign = !negativeSign;
  }
}

//@? Used this version when I was defiing last number w/ the negative in it.
/* function invertNumbers() {
  console.log('flipping num');
  if (negativeSign) {
    let index = display.textContent.lastIndexOf(lastNumber);
    let newNum = lastNumber.replace(lastNumber, `-${lastNumber}`);
    console.log({ newNum });
    // display.textContent = display.textContent.replace(lastNumber, newNum);
    display.textContent = display.textContent
      .substring(0, index)
      .concat(newNum);
    // mathExpression = mathExpression.replace(lastNumber, newNum);
    mathExpression = mathExpression.substring(0, index).concat(newNum);
    lastNumber = newNum;
    negativeSign = !negativeSign;
  } else if (!negativeSign) {
    let index = display.textContent.lastIndexOf(lastNumber);
    // display.textContent.substring(0, index).concat(xnum)
    let positiveLastNum = String(Math.abs(lastNumber.match(digits)[0]));
    console.log(positiveLastNum);
    newNum = lastNumber.replace(`${lastNumber}`, positiveLastNum);
    // display.textContent = display.textContent.replace(
    //   lastNumber,
    //   positiveLastNum
    // );
    display.textContent = display.textContent
      .substring(0, index)
      .concat(positiveLastNum);
    // mathExpression = mathExpression.replace(lastNumber, positiveLastNum);
    mathExpression = mathExpression.substring(0, index).concat(positiveLastNum);
    lastNumber = positiveLastNum;
    negativeSign = !negativeSign;
  }
} */

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
    invertNumbers();
  }

  /* 
    
    console.log('last btn this');
    // negativeSign = false;
    if (display.textContent.match(digits)) {
      if (negativeSign) {
        let index = display.textContent.lastIndexOf(lastNumber);
        console.log({ negativeSign });
        newNum = lastNumber.replace(lastNumber, `-${lastNumber}`);
        console.log({ newNum });
        // display.textContent = display.textContent.replace(lastNumber, newNum);
        display.textContent = display.textContent
          .substring(0, index)
          .concat(newNum);
        // mathExpression = mathExpression.replace(lastNumber, newNum);
        mathExpression = mathExpression.substring(0, index).concat(newNum);
        lastNumber = newNum;
        negativeSign = !negativeSign;
        return;
      } else if (!negativeSign) {
        let index = display.textContent.lastIndexOf(lastNumber);
        newNum = lastNumber.slice(1);
        console.log({ newNum });
        // display.textContent = display.textContent.replace(lastNumber, newNum);
        display.textContent = display.textContent
          .substring(0, index)
          .concat(newNum);
        // mathExpression = mathExpression.replace(lastNumber, newNum);
        mathExpression = mathExpression.substring(0, index).concat(newNum);
        lastNumber = lastNumber.slice(1);
        negativeSign = !negativeSign;
        return;
      } */

  /*   if (negativeSign) {
      display.textContent += '-';
      mathExpression += '-';
      negativeSign = !negativeSign;
    } else if (!negativeSign) {
      display.textContent = display.textContent.replace('-', '');
      mathExpresion = mathExpression.replace('-', '');
      negativeSign = !negativeSign;
    } */

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

//Still needs work on + - sign to refine.  Things like +/- 7 +  +/- 7.  Break the calc.  It also breaks in  places regarding going ham on the plus minus button messing up the expression due to the way the last number is rendered inside the mange number function.

//Also need some logic on plus minus button if the last button was the equals button.
//That button is so hard to manage.  Although I wonder if it would be easier to push the values into an mathexpression array?
