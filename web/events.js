gl.captureMouse();
gl.captureKeys();
gl.onmouse = onMouse;
gl.onkeydown = onKey;
//This file defines all the events handling functions

function onMouse(e) {
    //console.log(e);   //*** debugging
    if (e.type == "mousedown") {
        var ray = camera.getRay(e.canvasx, e.canvasy);
        var coll_node = scene.testRay(ray);
        if (coll_node) {
            console.log(coll_node.name, ray.collision_point);
            if (coll_node.is_character) //if character clicked
            {
                chatTab.value = coll_node.name;
                visibleChat();
                //openChat();
                console.log(`This user is called "${coll_node.name}".`);
                //visibleChat(coll_node.name);
                //... ***CAMBIAR AL CHAT PRIVADO DEL USER AL USER CLICKADO***
            }
        }
    }

    if (e.dragging && freecam) {
        //camera.orbit(e.deltax * 0.01, [0,1,0] );
        //var right = camera.getLocalVector([1,0,0]);
        //camera.orbit(e.deltay * 0.01,right );

        //rotating camera
        camera.rotate(e.deltax * -0.01, [0, 1, 0]);
        var right = camera.getLocalVector([1, 0, 0]);
        camera.rotate(e.deltay * -0.01, right);
    }
}

function onKey(e) {
    //console.log(e);   //*** debugging
    let keyNumber = parseInt(e.key);
    if (e.key == "Tab") {
        freecam = !freecam;
        e.preventDefault();
        e.stopPropagation();
        return true;
    }
    if (e.key == "Shift") {
        fixed_camera.used = !fixed_camera.used;
        if (fixed_camera.used) { //set the fixed camera configuration
            freecam = false;
            camera.configure(fixed_camera.configuration);
        }
        return true;
    } else if ( keyNumber >= 1 && keyNumber <= 9 ) {
        setDance(character, keyNumber );
    }
    else if (keyNumber == 0) { //angry - waiting
        character.waiting = !character.waiting;
        character.waving = false;
        character.dance = false;
    } else if (e.code == "Space") {
        character.waving = !character.waving;
        character.waiting = false;
        character.dance = false;
    }
}

function setDance(character, index) {
    if (!character.dance || character.dance == index)
        character.dance = !character.dance;
    if (character.dance) {
        character.dance = index;
    }
}