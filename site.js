let currentInput = "";
let lastAnswer = 0;

const display = document.getElementById('display');
const history = document.getElementById('history');

function input(value) {
    // If display is 0, replace it, otherwise append
    if (currentInput === "0") currentInput = value;
    else currentInput += value;
    updateDisplay();
}

function clearScreen() {
    currentInput = "";
    updateDisplay("0");
}

function backspace() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

function updateDisplay(val) {
    display.innerText = val || currentInput || "0";
}

let currentBase = "DEC"; // Can be 'DEC' or 'BIN'

function switchBase(base) {
    currentBase = base;
    
    // Update UI highlights
    document.getElementById('decMode').classList.toggle('active', base === 'DEC');
    document.getElementById('binMode').classList.toggle('active', base === 'BIN');
    
    // Disable/Enable non-binary buttons
    const nonBinButtons = document.querySelectorAll('.btn-num-extra'); // Add this class to buttons 2-9
    nonBinButtons.forEach(btn => btn.disabled = (base === 'BIN'));
    
    clearScreen();
}

function calculate() {
    try {
        let expression = currentInput
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/ans/gi, lastAnswer);

        let result;

        if (currentBase === "BIN") {
            // 1. Convert binary operands to decimal for calculation
            // This regex finds binary numbers and wraps them in a decimal converter
            let decimalExpression = expression.replace(/[01]+/g, (match) => {
                return parseInt(match, 2);
            });
            
            result = math.evaluate(decimalExpression);
            
            // 2. Convert result back to Binary string
            lastAnswer = result;
            currentInput = (result >>> 0).toString(2); // >>> 0 handles unsigned 32-bit conversion
        } else {
            // Standard Decimal Mode
            expression = expression
                .replace(/π/g, 'pi')
                .replace(/ln\(/g, 'log(')
                .replace(/sin\(/g, 'sin(deg ')
                .replace(/cos\(/g, 'cos(deg ')
                .replace(/tan\(/g, 'tan(deg ');

            result = math.evaluate(expression);
            currentInput = math.format(result, { precision: 10 }).toString();
            lastAnswer = currentInput;
        }

        history.innerText = (currentBase === "BIN" ? "BIN: " : "") + expression + " =";
        updateDisplay();
    } catch (error) {
        display.innerText = "Base ERROR";
        currentInput = "";
    }
}

// Support for keyboard input
window.addEventListener('keydown', (e) => {
    if (e.key >= 0 && e.key <= 9) input(e.key);
    if (e.key === '+') input('+');
    if (e.key === '-') input('-');
    if (e.key === '*') input('*');
    if (e.key === '/') input('/');
    if (e.key === 'Enter') calculate();
    if (e.key === 'Backspace') backspace();
    if (e.key === 'Escape') clearScreen();
});
