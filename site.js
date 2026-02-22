let display = document.getElementById("display");
let angleMode = "DEG";
let lastAnswer = 0;

function insert(value) {
  if (display.innerText === "0") display.innerText = "";
  display.innerText += value;
}

function clearAll() {
  display.innerText = "0";
}

function del() {
  display.innerText = display.innerText.slice(0, -1) || "0";
}

function toggleAngle() {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  document.querySelector(".mode").innerText = angleMode;
}

function toRadians(x) {
  return angleMode === "DEG" ? x * Math.PI / 180 : x;
}

// Continued-fraction decimal → fraction
function toFraction(x, tolerance = 1e-10, maxDen = 1000000) {
  if (!isFinite(x)) return "Math ERROR";

  const sign = x < 0 ? "-" : "";
  x = Math.abs(x);

  if (Number.isInteger(x)) return sign + x;

  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = x;

  while (true) {
    let a = Math.floor(b);
    let h = a * h1 + h2;
    let k = a * k1 + k2;

    if (k > maxDen) {
      // fallback: clamp denominator growth
      return sign + h1 + "/" + k1;
    }

    if (Math.abs(x - h / k) < tolerance) {
      return sign + h + "/" + k;
    }

    h2 = h1; h1 = h;
    k2 = k1; k1 = k;

    const frac = (b - a);
    if (frac === 0) return sign + h + "/" + k;
    b = 1 / frac;
  }
}

// Convert display expression → valid JS
function toJS(expr) {
  return expr
    // UI operators
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\^/g, "**")
    // ANS constant
    .replace(/ANS/g, "(ANS)")
    // logs
    .replace(/log\(/g, "LOG(")
    .replace(/ln\(/g, "LN(")
    // trig
    .replace(/sin\(/g, "SIN(")
    .replace(/cos\(/g, "COS(")
    .replace(/tan\(/g, "TAN(")
    // roots:
    // √(x)  -> sqrt(x)
    .replace(/√\(/g, "SQRT(")
    // ∛(x) -> cbrt(x)
    .replace(/∛\(/g, "CBRT(")
    // n√(x) -> root(n,x)
    // Matches: number immediately before √(
    // Example: 4√(81) -> root(4,81)
    .replace(/(\d+(?:\.\d+)?)√\(/g, "ROOT($1,");
}

function calculate() {
  try {
    const jsExpr = toJS(display.innerText);

    const result = Function(
      "SIN", "COS", "TAN", "SQRT", "CBRT", "ROOT", "LOG", "LN", "ANS",
      "return " + jsExpr
    )(
      x => Math.sin(toRadians(x)),
      x => Math.cos(toRadians(x)),
      x => Math.tan(toRadians(x)),
      x => Math.sqrt(x),
      x => Math.cbrt(x),
      (n, x) => Math.pow(x, 1 / n),
      x => Math.log10(x),
      x => Math.log(x),
      lastAnswer
    );

    if (!Number.isFinite(result)) {
      display.innerText = "Math ERROR";
      return;
    }

    lastAnswer = result;
    display.innerText = toFraction(result);

  } catch (e) {
    display.innerText = "Syntax ERROR";
  }
}