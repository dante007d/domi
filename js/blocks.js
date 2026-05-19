// Define custom blocks for Bot movement
Blockly.Blocks['move_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move Forward");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Moves the bot forward one space.");
    this.setHelpUrl("");
  }
};

javascript.javascriptGenerator.forBlock['move_forward'] = function(block, generator) {
  return 'await movePlayerForward();\n';
};

Blockly.Blocks['maze_turn'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("turn")
        .appendField(new Blockly.FieldDropdown([
            ["left ↺", "turnLeft"], 
            ["right ↻", "turnRight"]
        ]), "DIR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
  }
};

javascript.javascriptGenerator.forBlock['maze_turn'] = function(block, generator) {
  var dir = block.getFieldValue('DIR');
  return 'await window.' + dir + '();\n';
};

Blockly.Blocks['maze_until'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("repeat until")
        .appendField(new Blockly.FieldImage("maze/marker.png", 15, 15, "*"))
        .appendField("do");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
  }
};

javascript.javascriptGenerator.forBlock['maze_until'] = function(block, generator) {
  var branch = generator.statementToCode(block, 'DO');
  return 'while (!window.isGoalReached()) {\n' +
         '  await new Promise(r => setTimeout(r, 0));\n' +
         branch +
         '}\n';
};

Blockly.Blocks['maze_if'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("if path")
        .appendField(new Blockly.FieldDropdown([
            ["ahead", "ahead"], 
            ["to the left ↺", "left"], 
            ["to the right ↻", "right"]
        ]), "DIR")
        .appendField("do");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
  }
};

javascript.javascriptGenerator.forBlock['maze_if'] = function(block, generator) {
  var dir = block.getFieldValue('DIR');
  var branch = generator.statementToCode(block, 'DO');
  return 'if (window.checkPath("' + dir + '")) {\n' + branch + '}\n';
};

Blockly.Blocks['maze_ifElse'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("if path")
        .appendField(new Blockly.FieldDropdown([
            ["ahead", "ahead"], 
            ["to the left ↺", "left"], 
            ["to the right ↻", "right"]
        ]), "DIR")
        .appendField("do");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("else");
    this.appendStatementInput("ELSE")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
  }
};

javascript.javascriptGenerator.forBlock['maze_ifElse'] = function(block, generator) {
  var dir = block.getFieldValue('DIR');
  var branch0 = generator.statementToCode(block, 'DO');
  var branch1 = generator.statementToCode(block, 'ELSE');
  return 'if (window.checkPath("' + dir + '")) {\n' + branch0 + '} else {\n' + branch1 + '}\n';
};


// Initialize Blockly Workspace
window.initBlockly = () => {
  if (window.workspace) return; // Prevent double initialization
  window.workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    grid: {spacing: 20, length: 3, colour: '#ccc', snap: true},
    trashcan: true,
    scrollbars: true,
    maxBlocks: 4
  });

  window.workspace.addChangeListener(() => {
    const indicator = document.getElementById('capacityIndicator');
    if (indicator && window.workspace.options.maxBlocks !== Infinity) {
      const remaining = window.workspace.remainingCapacity();
      indicator.innerText = `You have ${remaining} blocks left.`;
      indicator.style.display = 'block';
    } else if (indicator) {
      indicator.style.display = 'none';
    }
  });
};
