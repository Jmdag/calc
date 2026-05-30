let currentExpression = "";
let lastValidResult = null;

const display = document.getElementById('main-display');
const subDisplay = document.getElementById('sub-display');
const displayMode = document.getElementById('display-mode');

function insertText(text) {
    if (display.value === "Math Error" || display.value === "Syntax Error") {
        clearAll();
    }
    currentExpression += text;
    display.value = currentExpression;
}

function clearAll() {
    currentExpression = "";
    display.value = "";
    subDisplay.innerText = "";
    lastValidResult = null;
}

function deleteLast() {
    if (display.value === "Math Error" || display.value === "Syntax Error") {
        clearAll();
        return;
    }
    currentExpression = currentExpression.toString().slice(0, -1);
    display.value = currentExpression;
}

function formatResult(value, mode) {
    if (value === undefined || value === null) return "";
    
    // טיפול בתוצאות מרוכבות
    if (math.typeOf(value) === 'Complex') {
        return value.toString();
    }

    let decimalValue = math.number(value);
    
    // מצב עשרוני
    if (mode === 'decimal') {
        return math.round(decimalValue, 10).toString();
    } 
    
    // מצב שבר רגיל
    if (mode === 'fraction') {
        try {
            return math.format(math.fraction(decimalValue), { fraction: 'ratio' });
        } catch (e) {
            return math.round(decimalValue, 10).toString();
        }
    } 
    
    // מצב שבר מעורב
    if (mode === 'mixed') {
        try {
            let frac = math.fraction(decimalValue);
            let sign = frac.s < 0 ? "-" : "";
            let n = math.abs(frac.n);
            let d = frac.d;
            
            if (d === 1) return (sign + n).toString();
            if (n < d) return sign + n + "/" + d;
            
            let whole = math.floor(n / d);
            let remainder = n % d;
            return `${sign}${whole} ${remainder}/${d}`;
        } catch (e) {
            return math.round(decimalValue, 10).toString();
        }
    }
    
    return math.round(decimalValue, 10).toString();
}

function updateDisplay() {
    if (lastValidResult !== null) {
        display.value = formatResult(lastValidResult, displayMode.value);
    }
}

function calculateResult() {
    if (!currentExpression) return;
    
    try {
        let evalExpression = currentExpression;
        
        // סגירה אוטומטית של סוגריים למניעת Syntax Error
        let openP = (evalExpression.match(/\(/g) || []).length;
        let closeP = (evalExpression.match(/\)/g) || []).length;
        while (openP > closeP) {
            evalExpression += ')';
            closeP++;
        }

        // בדיקת חלוקה באפס 
        if (evalExpression.includes('/0') || evalExpression.includes('/ 0')) {
            throw new Error("Division by zero");
        }

        // התיקון: חזרנו לאובייקט ה-scope היציב.
        // הלוגיקה של השורש נכתבה מחדש ב-JS טהור כדי למנוע התנגשויות מול math.js
        const scope = {
            sin: function(x) { return math.sin(math.unit(x, 'deg')); },
            cos: function(x) { return math.cos(math.unit(x, 'deg')); },
            tan: function(x) { return math.tan(math.unit(x, 'deg')); },
            
            // המשתנה n הוא הסדר של השורש (לבחירתך)
            nthRoot: function(x, n) { 
                if (n === undefined) n = 2; // ברירת מחדל לשורש ריבועי
                if (x < 0 && n % 2 === 0) throw new Error("Complex");
                // שימוש ב-Math.sign ו-Math.pow פותר לחלוטין את שגיאות התחביר
                return Math.sign(x) * Math.pow(Math.abs(x), 1/n); 
            },
            
            // לוגריתם לפי בסיס לבחירתך
            log: function(x, base) {
                if (base === undefined) return Math.log10(x);
                return Math.log(x) / Math.log(base);
            }
        };

        // חישוב הביטוי
        let result = math.evaluate(evalExpression, scope);
        
        // בדיקת שגיאות מתמטיות נוספות
        if (result === Infinity || result === -Infinity || math.isNaN(result)) {
            throw new Error("Math Error");
        }

        lastValidResult = result;
        subDisplay.innerText = evalExpression + " =";
        
        let finalStr = formatResult(result, displayMode.value);
        
        display.value = finalStr;
        currentExpression = finalStr;

    } catch (error) {
        console.error(error);
        if (error.message.includes("Division by zero") || error.message === "Math Error" || error.message.includes("Complex")) {
            display.value = "Math Error";
        } else {
            display.value = "Syntax Error";
        }
        currentExpression = "";
        lastValidResult = null;
    }
}

// פתרון משוואה ריבועית
function solveQuadratic() {
    const a = parseFloat(document.getElementById('quad-a').value);
    const b = parseFloat(document.getElementById('quad-b').value);
    const c = parseFloat(document.getElementById('quad-c').value);
    const resultDiv = document.getElementById('quad-result');

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        resultDiv.innerText = "נא להזין מקדמים תקינים";
        return;
    }
    
    if (a === 0) {
        resultDiv.innerText = "a לא יכול להיות 0 במשוואה ריבועית";
        return;
    }

    const delta = Math.pow(b, 2) - (4 * a * c);

    if (delta > 0) {
        let x1 = (-b + Math.sqrt(delta)) / (2 * a);
        let x2 = (-b - Math.sqrt(delta)) / (2 * a);
        x1 = math.round(x1, 5);
        x2 = math.round(x2, 5);
        resultDiv.innerText = `x₁ = ${x1} , x₂ = ${x2}`;
    } else if (delta === 0) {
        let x = -b / (2 * a);
        x = math.round(x, 5);
        resultDiv.innerText = `x = ${x}`;
    } else {
        resultDiv.innerText = "אין פתרון ממשי (Math Error)";
    }
}
