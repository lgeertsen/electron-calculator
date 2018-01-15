import React from 'react';
import math from 'mathjs';
// let MQ;
// let editorField;

const assoc = {
  "^" : "right",
  "*" : "left",
  "/" : "left",
  "+" : "left",
  "-" : "left"
};

const prec = {
  "^" : 4,
  "*" : 3,
  "/" : 3,
  "+" : 2,
  "-" : 2
};

const functionVars = {
  "sin": 1,
  "cos": 1,
  "tan": 1,
  "sqrt": 1,
}

const functions = {
  "sin": value => { return Math.sin(value) },
  "cos": value => { return Math.cos(value) },
  "tan": value => { return Math.tan(value) },
  "sqrt": value => { return Math.sqrt(value) },
}

var peek = function(array) {
  return array.slice(-1)[0]; //retrieve the last element of the array
};

var addNode = function (array, operatorToken) {
  var n = functionVars[operatorToken.value];
  if(n == 1) {
    var leftChildNode = array.pop();
  } else {
    var leftChildNode = array.pop();
    var rightChildNode = array.pop();
  }
	array.push(new ASTNode(operatorToken, leftChildNode, rightChildNode));
}

var Token = function(type, value) {
 this.type = type;
 this.value = value;

 this.precedence = function() {
   return prec[this.value];
 }

 this.associativity = function() {
   return assoc[this.value];
 }
}

var ASTNode = function(token, leftChildNode, rightChildNode) {
	this.token = token.value;
  this.type = token.type;
	this.leftChildNode = leftChildNode;
	this.rightChildNode = rightChildNode;

  this.showTree = function(count) {
    var blank = "";
    for(var i = 0; i < count; i++) {
      blank += " ";
    }
    console.log(blank + count + ": " + this.token);
    if(this.leftChildNode) {
      this.leftChildNode.showTree(count+1);
    }
    if(this.rightChildNode) {
      this.rightChildNode.showTree(count+1);
    }
     // if (!this.leftChildNode && !this.rightChildNode) {
     //   return this.token + "\t=>null\n" + Array(count).join("\t") + "=>null";
     // } else if (!this.rightChildNode) {
     //   return this.token + "\t=>" + this.leftChildNode.showTree(count) + "\n" + Array(count+1).join("\t") + "=>null";
     // } else if (!this.leftChildNode) {
     //   return this.token + "\t=>null\n" + Array(count).join("\t") + "=>" + this.rightChildNode.showTree(count);
     // }
     // var count = count || 1;
     // count++;
     // return this.token.type + "\t=>" + this.leftChildNode.showTree(count) + "\n" + Array(count).join("\t") + "=>" + this.rightChildNode.showTree(count);
  };

  this.evaluate = function() {
    var leftValue;
    var rightValue;
    if(!this.leftChildNode && ! this.rightChildNode) {
      return this.token;
    } else if(!this.rightChildNode) {
      leftValue = this.leftChildNode.evaluate();
      return functions[this.token](leftValue);
    } else {
      leftValue = this.leftChildNode.evaluate();
      rightValue = this.rightChildNode.evaluate();
      return eval(leftValue + this.token + rightValue);
    }
  }
}

export default class Calculator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '\sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6}',
      equation: '',
      result: '',
      decimalAdded: false,
      keyFired: false,
      editor: undefined
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDown.bind(this));
    document.addEventListener('keyup', this.keyUp.bind(this));
    this.loadScript("/static/mathquill-0.10.1/mathquill.js", this.addMathField.bind(this)); // Set it's src to the provided URL
  }

  addMathField() {
    var MQ = MathQuill.getInterface(2);
    var editorField = document.getElementById('myEditor');
    var editor = MQ.MathField(editorField, {});
    this.setState({editor: editor});
  }

  loadScript(url, callback){
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    script.onreadystatechange = callback;
    script.onload = callback;

    head.appendChild(script);
  }

  keyDown(e) {
    // e.preventDefault();

    console.log(e.key);
    if(!this.state.keyFired) {
      this.setState({keyFired: true});
      const numbers = "0123456789";
      const operators = "+-*/";
      if(numbers.indexOf(e.key) != -1) {
        document.getElementsByName(e.key)[0].classList.add("pushed");
        this.handleNumber(e.key);
      } else if(operators.indexOf(e.key) != -1) {
        document.getElementsByName(e.key)[0].classList.add("pushed");
        this.handleOperator(e.key, e.key);
      } else if(e.keyCode == 13) {
        document.getElementsByName(e.key)[0].classList.add("pushed");
        this.evaluate();
      } else if(e.key == "ArrowLeft") {
        this.state.editor.keystroke('Left');
      } else if(e.key == "ArrowRight") {
        this.state.editor.keystroke('Right');
      }
    }
  }

  keyUp(e) {
    this.setState({keyFired: false});
    let elem = document.getElementsByName(e.key)[0];
    if(elem != undefined) {
      elem.classList.remove("pushed");
    }
  }

  handleButtonClick(e) {
    this.handleNumber(e.target.getAttribute('name'));
    // this.setCalculatorstate(e.target.innerHTML, e.target.getAttribute('name'), this.state.decimalAdded);
  }

  handleNumber(value) {
    this.state.editor.write(value);
  }

  handleDecimalClick() {
    if(!this.state.decimalAdded) {
      this.setCalculatorstate('.', '.', true);
    }
  }

  handleOperatorClick(e) {
    this.handleOperator(e.target.innerHTML, e.target.getAttribute('name'));
  }

  handleOperator(v, operation) {
    const operators = ['+', '-', '*', '/'];
    let value = this.state.value;
    let equation = this.state.editor.latex();
    const lastChar = equation[equation.length-1];

    if(equation != '' && operators.indexOf(lastChar) == -1) {
      this.setState({decimalAdded: false});
      this.state.editor.write(operation);
    } else if(equation == '' && v == '-') {
      this.setState({decimalAdded: false});
      this.state.editor.write(operation);
    } else if(equation.length > 1 && operators.indexOf(lastChar) != -1) {
      // value = value.substring(0, value.length-1);
      // equation = equation.substring(0, equation.length-1);
      value = value.replace(/.$/, v);
      equation = equation.replace(/.$/, operation);
      this.setState({decimalAdded: false});
      this.state.editor.latex(equation);
      // this.setState({value: value, equation: equation});
    }
  }

  handleFuntionClick(e) {
    var addP = e.target.getAttribute("data-addP");
    console.log("Add Parenthesis: " + addP);
    if(addP == "true") {
      this.state.editor.cmd("\\" + e.target.getAttribute('name'));
      this.state.editor.cmd("(");
    } else if(e.target.getAttribute('name') == "(") {
      this.state.editor.cmd("(");
    } else if(e.target.getAttribute('name') == ")") {
      this.state.editor.cmd(")");
    } else {
      this.state.editor.cmd("\\" + e.target.getAttribute('name'));
    }
  }

  handleArrowClick(e) {
    this.state.editor.keystroke(e.target.getAttribute('name'));
  }

  setCalculatorstate(v, e, d) {


    // let value = this.state.value;
    let equation = this.state.equation;
    // value += v;
    equation += e;
    var value = this.state.editor.latex();
    value += e;

    console.log("screen: " + value);
    console.log("equation: " + equation);
    this.setState({value: value, equation: equation, decimalAdded: d});
    // MQ.StaticMath(myEditor);
    this.state.editor.latex(value);

  }

  clear() {
    this.setState({value: '', equation: '', result: ''});
    this.state.editor.latex('');
  }

  isDigit(char) {
    return /\d/.test(char);
  }

  isOperator(char) {
    return /\+|-|\*|\//.test(char);
  }

  isLetter(char) {
  	return /[a-z]/i.test(char);
  }

  tokenize(equation) {
    equation = equation.split("");
    // console.log(equation);

    var tokens = [];
    var letterBuffer = [];
    var numberBuffer = [];

    equation.forEach((char, idx) => {
      if(this.isDigit(char)) {
        numberBuffer.push(char);
      } else if(char == ".") {
        numberBuffer.push(char);
      } else if(char == "\\") {
        if(numberBuffer.length) {
          tokens.push(new Token("Literal", numberBuffer.join("")));
          numberBuffer = [];
          //tokens.push(new Token("Operator", "*"));
        }
        if(letterBuffer.length) {
          tokens.push(new Token("Function", letterBuffer.join("")));
          letterBuffer = [];
        }
      } else if(this.isLetter(char)) {
        letterBuffer.push(char);
      } else if(this.isOperator(char)) {
        if(numberBuffer.length) {
          tokens.push(new Token("Literal", numberBuffer.join("")));
          numberBuffer = [];
        }
        tokens.push(new Token("Operator", char));
      } else if(char == "(") {
  			letterBuffer=[];
  			if(numberBuffer.length) {
          tokens.push(new Token("Literal", numberBuffer.join("")));
          numberBuffer = [];
  				tokens.push(new Token("Operator", "*"));
  			}
  			tokens.push(new Token("Left Parenthesis", char));
      } else if(char == ")") {
        letterBuffer=[];
        if(numberBuffer.length) {
          tokens.push(new Token("Literal", numberBuffer.join("")));
          numberBuffer = [];
  			}
        tokens.push(new Token("Right Parenthesis", char));
      } else if(char == "{") {
        if(letterBuffer.length) {
          tokens.push(new Token("Function", letterBuffer.join("")));
          letterBuffer = [];
        }
        tokens.push(new Token("Left Parenthesis", char));
      } else if(char == "}") {
        if(numberBuffer.length) {
          tokens.push(new Token("Literal", numberBuffer.join("")));
          numberBuffer = [];
  			}
        tokens.push(new Token("Right Parenthesis", char));
      }
    });

    if (numberBuffer.length) {
      tokens.push(new Token("Literal", numberBuffer.join("")));
      numberBuffer = [];
    }

    tokens.forEach(function(token, index) {
      console.log(index + "=> " + token.type + "(" + token.value + ")");
    });
    return tokens;
  }

  toRPN(equation) {
    var outQueue=[];
    var opStack=[];

    var tokens = this.tokenize(equation);

    tokens.forEach(token => {
      if(token.type === "Literal") {
        outQueue.push(token);
      } else if(token.type === "Function") {
        opStack.push(token);
      } else if(token.type === "Operator") {
        while(peek(opStack)
              && (peek(opStack).type === "Operator")
              && ((token.associativity() === "left" && token.precedence() <= peek(opStack).precedence())
                  || (token.associativity() === "right" && token.precedence() < peek(opStack).precedence()))) {
          outQueue.push(opStack.pop());
        }
        opStack.push(token);
      } else if(token.type === "Left Parenthesis") {
        opStack.push(token);
      } else if(token.type === "Right Parenthesis") {
        while(peek(opStack)
              && peek(opStack).type !== "Left Parenthesis") {
          outQueue.push(opStack.pop());
        }
        opStack.pop();
        if(peek(opStack) && peek(opStack).type === "Function") {
          outQueue.push(opStack.pop());
        }
      }
    });

    return outQueue.concat(opStack.reverse());
  }

  parse(equation) {
    var outStack=[];
    var opStack=[];

    var tokens = this.tokenize(equation);

    tokens.forEach(token => {
      if(token.type === "Literal") {
        outStack.push(new ASTNode(token, null, null));
      } else if(token.type === "Function") {
        opStack.push(token);
      } else if(token.type === "Operator") {
        while(peek(opStack)
              && (peek(opStack).type === "Operator")
              && ((token.associativity() === "left" && token.precedence() <= peek(opStack).precedence())
                  || (token.associativity() === "right" && token.precedence() < peek(opStack).precedence()))) {
          addNode(outStack, opStack.pop());
        }
        opStack.push(token);
      } else if(token.type === "Left Parenthesis") {
        opStack.push(token);
      } else if(token.type === "Right Parenthesis") {
        while(peek(opStack)
              && peek(opStack).type !== "Left Parenthesis") {
          addNode(outStack, opStack.pop());
        }
        opStack.pop();
        if(peek(opStack) && peek(opStack).type === "Function") {
          addNode(outStack, opStack.pop());
        }
      }
    });

    while(peek(opStack)) {
  		addNode(outStack, opStack.pop());
  	}

    return outStack.pop();
  }

  evaluate() {
    // var equation = this.state.equation;
    // var result = eval(equation);
    // this.setState({result: result});
    var equation = this.state.editor.latex();
    if(equation.length == 0) {
      return;
    }
    console.log(equation);

    var rpn = this.toRPN(equation);
    console.log(rpn.map(token => token.value).join(" "));

    var ast = this.parse(equation);
    ast.showTree(0);
    // console.log(ast);
    var result = ast.evaluate();
    console.log("result: " + result);
    this.setState({result: result});
  }

  render() {
    return (
      <div id="calculator">

        {/* <script src="/static/mathquill-0.10.1/mathquill.js"></script>
        <script>
        var MQ = MathQuill.getInterface(2);
        console.log(MQ);
        var myEditor = document.getElementById('myEditor');
        MQ.StaticMath(myEditor);
        </script> */}

        <div className="top">
          <div className="screen">
            <div className="equation" id="myEditor"></div>
            <div className="result">{this.state.result}</div>
          </div>
        </div>
        <div className="keys">
          <span name="sin" data-addP="true" className="function" onClick={(e) => this.handleFuntionClick(e)}>sin</span>
          <span name="cos" data-addP="true" className="function" onClick={(e) => this.handleFuntionClick(e)}>cos</span>
          <span name="tan" data-addP="true" className="function" onClick={(e) => this.handleFuntionClick(e)}>tan</span>
          <span className="function">cos</span>
          <span name="Up" className="arrow center" onClick={(e) => this.handleArrowClick(e)}><i className="fas fa-chevron-up"></i></span>
          <span name="sqrt" data-addP="false" className="function" onClick={(e) => this.handleFuntionClick(e)}>sqrt</span>
          <span name="cos" data-addP="true" className="function" onClick={(e) => this.handleFuntionClick(e)}>cos</span>
          <span name="tan" data-addP="true" className="function" onClick={(e) => this.handleFuntionClick(e)}>tan</span>
          <span className="function">cos</span>
          <span name="Left" className="arrow" onClick={(e) => this.handleArrowClick(e)}><i className="fas fa-chevron-left"></i></span>
          <span name="Right" className="arrow rightButton" onClick={(e) => this.handleArrowClick(e)}><i className="fas fa-chevron-right"></i></span>
          <span name="(" data-addP="false" className="function" onClick={(e) => this.handleFuntionClick(e)}>(</span>
          <span name=")" data-addP="false" className="function" onClick={(e) => this.handleFuntionClick(e)}>)</span>
          <span name="tan" data-addP="true" className="function" onClick={(e) => this.handleFuntionClick(e)}>tan</span>
          <span className="function">cos</span>
          <span name="Down" className="arrow center" onClick={(e) => this.handleArrowClick(e)}><i className="fas fa-chevron-down"></i></span>
          <span name="7" onClick={(e) => this.handleButtonClick(e)}>7</span>
          <span name="8" onClick={(e) => this.handleButtonClick(e)}>8</span>
          <span name="9" onClick={(e) => this.handleButtonClick(e)}>9</span>
          <span name="/" className="operator" onClick={(e) => this.handleOperatorClick(e)}>÷</span>
          <span className="clear doubleWidth" onClick={() => this.clear()}>C</span>
          <span name="4" onClick={(e) => this.handleButtonClick(e)}>4</span>
          <span name="5" onClick={(e) => this.handleButtonClick(e)}>5</span>
          <span name="6" onClick={(e) => this.handleButtonClick(e)}>6</span>
          <span name="*" className="operator" onClick={(e) => this.handleOperatorClick(e)}>x</span>
          <span className="clear doubleWidth" onClick={() => this.clear()}>DEL</span>
          <span name="1" onClick={(e) => this.handleButtonClick(e)}>1</span>
          <span name="2" onClick={(e) => this.handleButtonClick(e)}>2</span>
          <span name="3" onClick={(e) => this.handleButtonClick(e)}>3</span>
          <span name="-" className="operator" onClick={(e) => this.handleOperatorClick(e)}>-</span>
          <span name="0" className="doubleWidth" onClick={(e) => this.handleButtonClick(e)}>0</span>
          <span name="." onClick={() => this.handleDecimalClick()}>.</span>
          <span name="+" className="operator" onClick={(e) => this.handleOperatorClick(e)}>+</span>
          <span name="Enter" className="eval" onClick={() => this.evaluate()}>=</span>
        </div>

        <style jsx>{`
          div {
            height: auto;
          }
          input,
          textarea,
          #calculator {
            padding: 20px 20px 9px;
            border-bottom-left-radius: 5px;
            border-bottom-right-radius: 5px;
            background: #34495e;
            font-family: 'Nova Mono', sans-serif;
            font-weight: bold;
            box-shadow: 0px 4px #1f2b38;
            -webkit-app-region: drag;
          }
          #calculator span,
          #calculator .screen {
            -webkit-app-region: no-drag;
          }
          .top {
            margin-bottom: 10px;
          }
          .top .screen {
            float: right;
            height: 120px;
            width: 431px;
            padding: 0 10px;
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
            box-shadow: inset 0px 4px rgba(0, 0, 0, 0.2);
            color: #fff;
            font-size: 20px;
            line-height: 60px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            text-align: right;
            letter-spacing: 1px;
          }
          .top .screen div {
            height: 60px;
            word-break: keep-all;
            white-space: nowrap;
          }
          #myEditor span.mq-cursor {
            width: 30px;
            height: 30px;
            background-color: pink;
            border: 3px solid green;
          }
          .mq-math-mode {
            font-family: 'Nova Mono', Symbola, "Times new Roman";
            line-height: 1.1;
            border: none;
          }
          .mq-focused {
            box-shadow: none;
          }
          .keys, .top {
            overflow: hidden;
          }
          .keys {
            margin-bottom: -43px;
          }
          .keys span {
            float: left;
            position: relative;
            top: 0;
            cursor: pointer;
            margin: 0 7px 11px 0;
            width: 66px;
            height: 36px;
            background: #ecf0f1;
            color: #4b5455;
            border-radius: 3px;
            box-shadow: 0px 4px #7e99a0;
            line-height: 36px;
            font-size: 18px;
            text-align: center;
            user-select: none;
            transition: all 0.1s ease;
          }
          .keys span.rightButton {
            margin-right: 0;
          }
          .keys span.doubleWidth {
            width: 139px;
          }
          .keys span.center {
            margin-left: 33px;
          }
          .keys span.function {
            background: #5cace2;
            box-shadow: 0px 4px #3498db;
            color: #fff;
          }
          .keys span.operator {
            background: #f7c370;
            box-shadow: 0px 4px #f39c12;
          }
          .keys span.arrow {
            background: #2ee2be;
            box-shadow: 0px 4px #1abc9c;
          }
          .keys span.eval {
            top: -47px;
            width: 139px;
            height: 83px;
            line-height: 83px;
            margin-right: 0;
            background: #55d88d;
            box-shadow: 0px 4px #2ecc71;
          }
          .keys span.clear {
            margin-right: 0;
            height: 36px;
            line-height: 36px;
            background: #eb6f63;
            box-shadow: 0px 4px #e74c3c;
            color: #fff;
          }
          .keys span:hover {
            background: #9b59b6;
            box-shadow: 0px 4px #5e3170;
            color: #fff;
          }
          .keys span.function:hover {
            background: #3498db;
            box-shadow: 0px 4px #185c8a;
            color: #fff;
          }
          .keys span.operator:hover {
            background: #f39c12;
            box-shadow: 0px 4px #955e07;
            color: #fff;
          }
          .keys span.arrow:hover {
            background: #1abc9c;
            box-shadow: 0px 4px #0f705d;
            color: #fff;
          }
          .keys span.eval:hover {
            background: #2ecc71;
            box-shadow: 0px 4px #1b7a43;
            color: #fff;
          }
          .keys span.clear:hover {
            background: #e74c3c;
            box-shadow: 0px 4px #9b1f13;
            color: #fff;
          }
          .keys span:active,
          .keys span.pushed {
            background: #9b59b6;
            box-shadow: 0px 0px #6b54d3;
          	top: 4px;
          }
          .keys span.function:active {
            box-shadow: 0px 0px #185c8a;
            top: 4px;
          }
          .keys span.operator:active,
          .keys span.operator.pushed {
            background: #f39c12;
            box-shadow: 0px 0px #955e07;
            top: 4px;
          }
          .keys span.arrow:active,
          .keys span.arrow.pushed {
            background: #1abc9c;
            box-shadow: 0px 0px #0f705d;
            top: 4px;
          }
          .keys span.eval:active,
          .keys span.eval.pushed {
            background: #2ecc71;
            box-shadow: 0px 0px #1b7a43;
            top: -43px;
          }
          .keys span.clear:active {
            background: #e74c3c;
            box-shadow: 0px 0px #9b1f13;
            top: 4px;
          }
        `}</style>
      </div>
    );
  }
}
