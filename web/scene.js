//This file defines all in the scene elements
//scene container
var scene = new RD.Scene();

//ZONES able to walk around
var walk_area = new WalkArea();
walk_area.addRect([-6.3, 0.1, -3.8], 13, 7.5); //ouside area
walk_area.addRect([1.8, 0.1, 3.2], 2, 2);
walk_area.addRect([15.5, 0.1, 28.5], -23, -23.7); //inside area

//BOARDS
let canvasPos = [
    [4, 4.5, 29],
    [17, 3, 20],
    [-8.3, 3, 20],
    [17, 3, 11],
    [-8.3, 3, 10]
];

for (let i = 0; i < 5; i++) {
    var board = new RD.SceneNode();
    board.color = [0.7, 0.7, 0.7, 1];
    board.name = "board " + i;
    board.mesh = "plane";
    board.flags.two_sided = true;
    if (i == 0) {
        board.scale(5);
    } else {
        board.scale(3);
        board.rotation = [0, 0.707, 0];
    }

    board.position = canvasPos[i];
    board.textures.color = "canvas_texture";
    scene.root.addChild(board);
}



var canvasvideo = document.createElement("canvas")
canvasvideo.width = 500;
canvasvideo.height = 500;

//SCENE
var room_node = new RD.SceneNode();
room_node.name = "room";
room_node.loadGLTF("data/disco.glb");
room_node.flags.two_sided = false;
room_node.color = [1, 0.5, 0.5, 1];
scene.root.addChild(room_node);


//for debugging ray
var sphere = new RD.SceneNode();
sphere.name = "sphere";
sphere.layers = 2;
sphere.mesh = "sphere";
sphere.scale(0.05);
sphere.moveLocal([0, -0.1, 0]); //avoid seeing it in scene by default
sphere.color = [250 / 255, 237 / 255, 39 / 255, 1];
scene.root.addChild(sphere);

//Node layer 0b1 and 0b10 is for objects, layer 0b100 for characters
var CHARACTERS_LAYER = 4; //4 is 100 in binary

//CHARACTERS
var characters = []; //array to group all the characters in room

var character = new RD.SceneNode();
character.name = "user";
character.layers = CHARACTERS_LAYER;
character.is_character = true; //in case we want to know if an scene node is a character
character.scale(0.01);
character.mesh = "data/girl.wbin";
character.texture = "data/girl_low.png";
character.anim_name = "idle";
scene.root.addChild(character);
characters.push(character);


//CHARACTERS FUNCTIONS
function avatarCharacter(avatar) { //select the texture
    var texSelect;
    avatar % 6
    if (avatar <= 1) {
        texSelect = "data/girl_low.png";
    } else {
        texSelect = `data/girl_low${avatar-1}.png`;
    }
    return texSelect;
} //we decided to put 6 examples as placeholders to show customization

function namePanel(character) { //function to set each user their name on their heads
    let charBoard = scene.root.findNodeByName("board "+ character.name);

    var boardCanvas = document.createElement("canvas");
    let ctx = boardCanvas.getContext("2d");
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.font = "50px Arial";
    ctx.fillText(character.name,30, 85);

    if (!charBoard) { //si no tiene un cartel con el username
        charBoard = new RD.SceneNode();
        charBoard.color = [0.2, 0.2, 0.2, 0.2];
        charBoard.name = "board " + character.name;
        charBoard.mesh = "plane";
        charBoard.flags.two_sided = true;
        scene.root.addChild(charBoard);

        //create the canvas texture for the first time
        gl.textures["board " + character.name] = GL.Texture.fromImage(boardCanvas);
    }

    if (character.skeleton) {
        let head_matrix = character.skeleton.getBoneMatrix("mixamorig_Head", true);
        let gm = character.getGlobalMatrix();
        let m = mat4.create();
        mat4.multiply( m, gm, head_matrix );
        mat4.scale( m, m, [20,20,20]);
        charBoard.fromMatrix( m );
        charBoard.moveLocal([0, 0.45, 0]);
    } else {
        charBoard.position = [0,0,0];
        charBoard.moveLocal([0, -0.45, 0]);
    }
    charBoard.scale(3);
    
    
    charBoard.textures.color = "board " + character.name;
}

async function addCharacter(name, position, avatar) {
    var character = new RD.SceneNode();
    character.name = name;
    character.layers = CHARACTERS_LAYER;
    character.is_character = true; //in case we want to know if an scene node is a character
    character.scale(0.01);
    character.position = position;
    character.mesh = "data/girl.wbin";
    character.texture = avatarCharacter(avatar);
    character.anim_name = "idle";
    await scene.root.addChild(character);

    namePanel(character)
    characters.push(character); //used for animation rendering
}

function setUCharacter(position, avatar) { //set user character position, last saved
    character.position = position;
    character.texture = avatarCharacter(avatar);
}

function updateCharacter(name, data, avatar) {
    var character = scene.root.findNodeByName(name); //find the user character by name
    if(avatar) character.texture = avatarCharacter(avatar);
    if (data) { //case of false if we dont want to update it
        if(data.pos) character.position = data.pos;
        if(data.rotation) character.rotation = data.rotation;
        if(data.pos) character.anim_name = data.anim_name;
        if(data.time) character.time = data.time;
    }
}

function removeCharacter(name) { //filter by name, since is the username (unique)
    scene.root.removeChild(scene.root.findNodeByName(name));
    if (scene.root.findNodeByName("board " + name)) scene.root.removeChild(scene.root.findNodeByName("board " + name)); //remove also its name board
}