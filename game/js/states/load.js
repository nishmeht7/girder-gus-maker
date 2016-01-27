var STATE_LOAD = {};

STATE_LOAD.preload = function () {
    game.load.image('BrickBlack', 'game/images/brick_black.png');
    game.load.image('BrickBreak', 'game/images/brick_break.png');
    game.load.image('BrickRed', 'game/images/brick_red.png');
    game.load.image('Girder', 'game/images/girder.png');
    game.load.image('Tool', 'game/images/tool.png');
    game.load.spritesheet('Gus', 'game/images/gus.png', 32, 32);
}

STATE_LOAD.create = function () {
    console.log('create');
    game.stage.setBackgroundColor('#000');
    game.state.start( "game" );

}