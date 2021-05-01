//This file is the core for the WebGL used on canvas
//setup context
var canvas = document.querySelector("canvas");
var gl = GL.create({ canvas: canvas });

//renderer of the scene
var renderer = new RD.Renderer(gl);

//draws the whole frame
function draw() {
    if (!freecam && !fixed_camera.used) {
        //3rd person view
        let eye = character.localToGlobal([0, 220, -180]);
        let center = character.localToGlobal([0, 180, 100]);

        vec3.lerp(eye, camera.position, eye, 0.1);
        vec3.lerp(center, camera.target, center, 0.1);

        eye = walk_area.adjustPosition(eye); //retain the cam inside*
        camera.lookAt(eye, center, [0, 1, 0]);
    }


    var parent = canvas.parentNode;
    var rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    camera.perspective(camera.fov, canvas.width / canvas.height, 0.1, 1000); //to render in perspective mode

    //clear
    gl.viewport(0, 0, canvas.width, canvas.height); //adjust size
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawWorld(camera);
}

//draws the world from a camera point of view
function drawWorld(camera) {
    if (character.position[2] >= 15.5) {
        fixed_camera.configuration = fixed_camera.configurationInside[1];
    } else if (character.position[2] >= 4.4) {
        fixed_camera.configuration = fixed_camera.configurationInside[0];
    } else {
        fixed_camera.configuration = fixed_camera.configurationOutside;
    }
    if (fixed_camera.used) //update the configuration
        camera.configure(fixed_camera.configuration);

    renderer.render(scene, camera);

    //render gizmos (show areas)
    // var vertices = walk_area.getVertices();
    // if(vertices)
    // 	renderer.renderPoints(vertices,null,camera,null,null,0.1,gl.LINES);

    /*
    gl.disable( gl.DEPTH_TEST );
    if(character.skeleton)
    {
    	var vertices = character.skeleton.getVertices( character.getGlobalMatrix() );
    	if(vertices)
    		renderer.renderPoints(vertices,null,camera,null,null,0.1,gl.LINES);
    	gl.enable( gl.DEPTH_TEST );
    }
    */
}

var weight = 0;

//CONTROLLER
function update(dt) {
    videoWall();
    updateCanvas2D();
    tex_canvas.uploadImage(canvasvideo);

    character.time = getTime() * 0.001; //could change to Date.prototype.getTime *** (avoid sending time for precisness)

    //characters animation rendering
    characters.forEach(character => {
        let anim = animations[character.anim_name];
        let t = character.time; //the actual time moment of each character

        if (anim && anim.duration) {
            anim.assignTime(t, true);
            let skeleton = new RD.Skeleton();

            if (character.old && character.old != character.anim) {
                old.assignTime(t, true);

                weight += dt * 0.1; //**rebajo el peso añadido para que se note el cambio **Y NADA
                if (weight >= 1) {
                    old = false;
                    weight = 0;
                }
                //console.log(`Mixing\n old: ${character.old_anim} -> new: ${character.anim_name} w:${weight}`); //debug				
                RD.Skeleton.blend(old.skeleton, anim.skeleton, weight, skeleton); //blending animations	
            } else {
                skeleton = anim.skeleton;
            }

            character.assignSkeleton(skeleton);
            character.shader = "texture_skinning";
            character.skeleton = skeleton; //this could be useful
            
            if (scene.root.findNodeByName("board " + character.name)) if(isNaN(scene.root.findNodeByName("board " + character.name).position[0])) scene.root.removeChild(scene.root.findNodeByName("board " + character.name));
            namePanel(character); //le ponemos su panel con el nombre de usuario
        }
    });


    //input
    if (freecam) {
        //free camera
        var delta = [0, 0, 0];
        if (gl.keys["W"])
            delta[2] = -1.5;
        else if (gl.keys["S"])
            delta[2] = 1;
        if (gl.keys["A"])
            delta[0] = -1;
        else if (gl.keys["D"])
            delta[0] = 1;
        camera.moveLocal(delta, dt * 10);
    } else {
        userMovement(character, dt);
    }
    //example of ray test from the character with the environment (layer 0b1) ***
    if (0) //debugg vista de choque
    {
        var center = character.localToGlobal([0, 45, 0]);
        var forward = character.getLocalVector([0, 0, 1]);
        vec3.normalize(forward, forward);
        var ray = new GL.Ray(center, forward);
        var coll_node = scene.testRay(ray, null, 100, 1);
        if (coll_node)
            sphere.position = ray.collision_point;
    }

    //example of placing object in head of character **
    // if(0 && character.skeleton)
    // {
    // 	var head_matrix = character.skeleton.getBoneMatrix("mixamorig_Head", true);
    // 	var gm = character.getGlobalMatrix();
    // 	var m = mat4.create();
    // 	mat4.multiply( m, gm, head_matrix );
    // 	mat4.scale( m, m, [20,20,20]);
    // 	sphere.fromMatrix( m );
    // }

}

function userMovement(character, dt) {
    character.old_anim = character.anim_name;

    var delta = [0, 0, 0];
    if (gl.keys["W"])
        delta[2] = 1;
    else if (gl.keys["S"])
        delta[2] = -1;
    vec3.scale(delta, delta, dt * 3.5);
    var is_moving = vec3.length(delta);
    if (is_moving) //if moving
    {
        character.moveLocal(delta);
        character.anim_name = "walking";

        character.dance = false;
        character.waiting = false;
        character.waving = false;
    }
    //other actions
    else if (character.dance) {
        character.anim_name = dances[character.dance - 1];
        character.waiting = false;
        character.waving = false;
    } else if (character.waiting) {
        character.anim_name = "waiting";
        character.dance = false;
        character.waving = false;
    } else {
        character.anim_name = character.waving ? "waving" : "idle";
        character.waiting = false;
        character.dance = false;
    }



    if (gl.keys["A"])
        character.rotate(dt * 1.5, [0, 1, 0]);
    else if (gl.keys["D"])
        character.rotate(dt * -1.5, [0, 1, 0]);

    character.position = walk_area.adjustPosition(character.position);
}


//last stores timestamp from previous frame
var last = performance.now();

function loop() {
    draw();


    //to compute seconds since last loop
    var now = performance.now();
    //compute difference and convert to seconds
    var elapsed_time = (now - last) / 1000;
    //store current time into last time
    last = now;

    if (socket.readyState && document.querySelector(".front-page").style.visibility == "hidden") {
        //now we can execute our update method
        update(elapsed_time);
    
        let action = { type: "update", cData: { pos: character.position, rotation: character.rotation, anim_name: character.anim_name, time: character.time } };
        socket.send(JSON.stringify(action));
    }

    //request to call loop() again before next frame
    requestAnimationFrame(loop);
}


function init() {
    //start loop
    loop();
}

init();


/*
var canvas2D = document.createElement("canvas");
canvas2D.width = 512;
canvas2D.height = 512;
//document.body.appendChild( canvas2D );
var tex_canvas = null;
function updateCanvas2D()
{
	var ctx = canvas2D.getContext("2d");
	ctx.fillStyle = "red";
	ctx.fillRect(0,0,canvas2D.width, canvas2D.height );
	ctx.fillStyle = "blue";
	ctx.save();
	ctx.translate(canvas2D.width * 0.5,canvas2D.height * 0.5);
	ctx.rotate( getTime() * 0.001 );
	ctx.fillRect(-50,-50,100,100);
	ctx.restore();

	if(!tex_canvas)
		gl.textures["canvas_texture"] = tex_canvas = GL.Texture.fromImage(canvas2D);
	else
		tex_canvas.uploadImage(canvas2D);
}
*/

/*
var video = document.createElement("video");
video.src = "../disney.mp4";
video.autoplay = true;
video.volume = 0.1;
video.oncanplay = function(){
	document.body.appendChild( video );
}
*/