// Defining global variables
const socket = io();

// Websocket events
const FULL_ROOM = "full-room";
const JOIN = "join";
const GAME_OBJECT = "game-object";
const ADD_PLAYER = "add-player";
const REMOVE_PLAYER = "remove-player";
const UPDATE_POSITION = "update-position";
const UPDATE_ROTATION = "update-rotation";
