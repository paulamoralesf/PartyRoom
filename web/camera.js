//This file defines the camera information used
var freecam = false;

//camera definition
var camera = new RD.Camera();
//camera.lookAt([0,1.5,4],[0,1,0],[0,1,0]); //to set eye,center and up
camera.fov = 60;

var fixed_camera = {};
fixed_camera.used = false;
fixed_camera.configurationOutside = {"type":1,"position":[0.1728731244802475,4.207231521606445,-5.992923736572266],"target":[0.2591288685798645,1.6633610725402832,2.6325159072875977],"up":[0,1,0],"fov":60,"near":0.1,"far":1000,"aspect":2.098360655737705};
fixed_camera.configurationInside = [
    {"type":1,"position":[3.218897819519043,5.276406288146973,3.9818716049194336],"target":[3.3272173404693604,0.8223452568054199,14.045711517333984],"up":[0,1,0],"fov":70,"near":0.1,"far":1000,"aspect":2.098360655737705},
    {"type":1,"position":[4.05,7.5,28],"target":[4.05,6.15,28], "up":[0,1,0],"fov":70,"near":0.1,"far":1000,"aspect":2.098360655737705}
];
fixed_camera.configuration = fixed_camera.configurationOutside; //initially outside
camera.configure(fixed_camera.configuration);