'use strict';

// Famous dependencies
var DOMElement = require('famous/dom-renderables/DOMElement');
var Mesh = require('famous/webgl-renderables/Mesh');
var Material = require('famous/webgl-materials/Material');
var FamousEngine = require('famous/core/FamousEngine');
var Plane = require('famous/webgl-geometries/primitives/Plane');
var DynamicGeometry = require('famous/webgl-geometries/DynamicGeometry');
var Camera = require('famous/components/Camera');
var Color = require('famous/utilities/Color');

// Boilerplate code to make your life easier
FamousEngine.init();

// Initialize with a scene; then, add a 'node' to the scene root
var root = FamousEngine.createScene().addChild();
var camera = new Camera(root);
camera.setDepth(2000);

var logo = root.addChild();
// Chainable API
logo
    // Set size mode to 'absolute' to use absolute pixel values: (width 250px, height 250px)
    .setSizeMode('absolute', 'absolute', 'absolute')
    .setAbsoluteSize(250, 250, 250)
    // Center the 'node' to the parent (the screen, in this instance)
    .setAlign(0.5, 0.5)
    // Set the translational origin to the center of the 'node'
    .setMountPoint(0.5, 0.5)
    .setRotation(1, 0, 0)
    // Set the rotational origin to the center of the 'node'
    .setOrigin(0.5, 0.5);

var image = Material.Texture('/images/famous_logo.png');
var time = Material.time();
var mix = Material.mix([image, [1,1,0,1], time]);

// var image = Material.Texture('/images/famous_logo.png');
var mesh = new Mesh(logo);
var geo = new DynamicGeometry();
var plane = new Plane({detailX: 100, detailY: 100});
geo.fromGeometry(plane);
geo.setDrawType('POINTS');

Material.registerExpression('planeVtx', {
    glsl: 'planeVtxPos();',
    defines: `vec3 planeVtxPos() {
        return vec3(u_planeVtxAmp, 0, 0);
    }`,
    output: 3
});

var offset = Material.planeVtx(null, {
    uniforms: { u_planeVtxAmp: 1 }
});

mesh.setGeometry(geo);
// mesh.setBaseColor(new Color('#ff0000'));
mesh.setBaseColor(image);
// mesh.setPositionOffset(offset);
var test = mesh.getPositionOffset();

var vtxPositions = geo.getVertexPositions();
// new DOMElement(logo, {
//     properties: {
//         'box-sizing': 'border-box',
//         'border': '2px solid blue',
//     }
// });

var radiusLookup = [];
var radius
var id = logo.addComponent({
    onUpdate: function(time) {
        // offset.setUniform('u_planeVtxAmp', Math.sin(time/500));

        for (var i = 0; i < vtxPositions.length; i+=3) {
            if (!radiusLookup[i/3]) radiusLookup[i/3] = calcRadius(vtxPositions[i], vtxPositions[i+1]);

            radius = radiusLookup[i/3];
            
            vtxPositions[i + 2] = Math.sin(6 * (radius - time/400)) * .2;
        }

        geo.setVertexPositions(vtxPositions);
        mesh.setGeometry(geo);

       logo.requestUpdateOnNextTick(id);
    }
});

function calcRadius(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

logo.requestUpdate(id);
