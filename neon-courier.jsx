import React, { useState, useEffect, useCallback, useRef } from 'react';

const TILE_SIZE = 32;
const PLAYER_SIZE = 20;
const DRONE_SIZE = 24;

const TILES = {
  EMPTY: 0, WALL: 1, PICKUP: 2, DELIVERY: 3, POWER_PANEL: 4,
  DOOR: 5, LASER_EMITTER: 6, GAP: 7, TUNNEL_ENTRANCE: 8, TUNNEL_EXIT: 9,
};

// 10 Levels - Bigger and Progressive
const LEVELS = [
  {
    id: 1, name: "First Run", description: "Pick up the data chip and deliver it.",
    width: 16, height: 12, playerStart: { x: 1, y: 1 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,0,0,0,0,1,1,1,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
      [1,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
      [1,0,0,1,1,1,0,0,0,0,1,1,1,0,3,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [], lasers: [], powerLinks: [],
  },
  {
    id: 2, name: "Drone Patrol", description: "Avoid the patrol drones!",
    width: 18, height: 14, playerStart: { x: 1, y: 1 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,3,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 5, y: 5, path: [{x:5,y:5},{x:12,y:5},{x:12,y:8},{x:5,y:8}], speed: 0.0175 },
      { x: 8, y: 7, path: [{x:8,y:7},{x:8,y:11}], speed: 0.014 },
    ],
    lasers: [], powerLinks: [],
  },
  {
    id: 3, name: "Power Grid", description: "Press E on panels to open doors.",
    width: 18, height: 14, playerStart: { x: 1, y: 6 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,2,0,1,0,0,0,1,1,0,0,0,0,1],
      [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,3,1],
      [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,4,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,1,0,0,0,1,1,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [{ x: 12, y: 5, path: [{x:12,y:5},{x:15,y:5},{x:15,y:8},{x:12,y:8}], speed: 0.0175 }],
    lasers: [], powerLinks: [{ panelPos: {x:5,y:8}, doorPos: {x:7,y:6} }],
  },
  {
    id: 4, name: "Laser Dance", description: "Time your movement through lasers.",
    width: 20, height: 14, playerStart: { x: 1, y: 6 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,6,0,0,0,0,6,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
      [1,0,0,0,0,0,0,6,0,0,0,0,6,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1],
      [1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 3, y: 6, path: [{x:3,y:6},{x:3,y:3},{x:3,y:10}], speed: 0.014 },
      { x: 16, y: 6, path: [{x:16,y:6},{x:16,y:10},{x:16,y:3}], speed: 0.014 },
    ],
    lasers: [
      { x: 7, y: 5, angle: 0, rotationSpeed: 0.0105 },
      { x: 12, y: 5, angle: Math.PI, rotationSpeed: -0.0105 },
      { x: 7, y: 7, angle: Math.PI/2, rotationSpeed: -0.0105 },
      { x: 12, y: 7, angle: Math.PI*1.5, rotationSpeed: 0.0105 },
    ],
    powerLinks: [],
  },
  {
    id: 5, name: "Rooftop Run", description: "Press SPACE near edges to jump gaps.",
    width: 22, height: 12, playerStart: { x: 1, y: 5 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,1],
      [1,0,2,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,3,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 9, y: 3, path: [{x:9,y:3},{x:9,y:8}], speed: 0.0175 },
      { x: 15, y: 7, path: [{x:15,y:7},{x:15,y:2}], speed: 0.0175 },
    ],
    lasers: [], powerLinks: [],
    gaps: [{ x1: 5, x2: 6, jumpDistance: 2 },{ x1: 11, x2: 12, jumpDistance: 2 },{ x1: 17, x2: 18, jumpDistance: 2 }],
  },
  {
    id: 6, name: "Service Tunnels", description: "Press E on tunnels to teleport.",
    width: 20, height: 16, playerStart: { x: 1, y: 1 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1],
      [1,0,0,2,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,0,0,0,8,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,1,9,0,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,3,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 9, y: 6, path: [{x:9,y:6},{x:9,y:9},{x:12,y:9},{x:12,y:6}], speed: 0.0175 },
      { x: 4, y: 7, path: [{x:4,y:7},{x:4,y:9}], speed: 0.014 },
    ],
    lasers: [], powerLinks: [], tunnels: [{ entrance: {x:5,y:3}, exit: {x:14,y:11} }],
  },
  {
    id: 7, name: "Double Extraction", description: "Collect BOTH chips!",
    width: 22, height: 16, playerStart: { x: 1, y: 7 }, totalChips: 2,
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
      [1,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,1],
      [1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 7, y: 4, path: [{x:7,y:4},{x:7,y:10},{x:14,y:10},{x:14,y:4}], speed: 0.0175 },
      { x: 10, y: 7, path: [{x:10,y:7},{x:10,y:2},{x:10,y:13}], speed: 0.021 },
    ],
    lasers: [], powerLinks: [],
  },
  {
    id: 8, name: "Security Complex", description: "Multiple panels, multiple doors.",
    width: 24, height: 16, playerStart: { x: 1, y: 7 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,2,0,4,0,5,0,0,0,0,0,0,0,0,5,0,4,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,4,0,0,0,5,0,0,0,0,0,0,0,0,5,0,0,0,3,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 11, y: 4, path: [{x:11,y:4},{x:11,y:11}], speed: 0.0175 },
      { x: 13, y: 11, path: [{x:13,y:11},{x:13,y:4}], speed: 0.0175 },
    ],
    lasers: [],
    powerLinks: [
      { panelPos: {x:5,y:3}, doorPos: {x:7,y:3} },
      { panelPos: {x:18,y:3}, doorPos: {x:16,y:3} },
      { panelPos: {x:3,y:12}, doorPos: {x:7,y:12} },
      { panelPos: {x:18,y:3}, doorPos: {x:16,y:12} },
    ],
  },
  {
    id: 9, name: "Laser Maze", description: "Navigate the laser grid carefully.",
    width: 24, height: 16, playerStart: { x: 1, y: 1 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [],
    lasers: [
      { x: 5, y: 3, angle: 0, rotationSpeed: 0.0084 },
      { x: 9, y: 3, angle: Math.PI/2, rotationSpeed: -0.0084 },
      { x: 13, y: 3, angle: Math.PI, rotationSpeed: 0.0084 },
      { x: 17, y: 3, angle: Math.PI*1.5, rotationSpeed: -0.0084 },
      { x: 5, y: 6, angle: Math.PI/4, rotationSpeed: -0.0105 },
      { x: 9, y: 6, angle: Math.PI*3/4, rotationSpeed: 0.0105 },
      { x: 13, y: 6, angle: Math.PI*5/4, rotationSpeed: -0.0105 },
      { x: 17, y: 6, angle: Math.PI*7/4, rotationSpeed: 0.0105 },
      { x: 5, y: 9, angle: Math.PI/2, rotationSpeed: 0.007 },
      { x: 9, y: 9, angle: 0, rotationSpeed: -0.007 },
      { x: 13, y: 9, angle: Math.PI*1.5, rotationSpeed: 0.007 },
      { x: 17, y: 9, angle: Math.PI, rotationSpeed: -0.007 },
      { x: 5, y: 12, angle: Math.PI*3/4, rotationSpeed: 0.0126 },
      { x: 9, y: 12, angle: Math.PI/4, rotationSpeed: -0.0126 },
      { x: 13, y: 12, angle: Math.PI*7/4, rotationSpeed: 0.0126 },
      { x: 17, y: 12, angle: Math.PI*5/4, rotationSpeed: -0.0126 },
    ],
    powerLinks: [],
  },
  {
    id: 10, name: "The Gauntlet", description: "The ultimate challenge. Collect 3 chips!",
    width: 28, height: 18, playerStart: { x: 1, y: 8 }, totalChips: 3,
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,2,0,4,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,4,0,2,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,0,0,6,0,0,0,6,0,0,0,6,0,0,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,2,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 4, y: 6, path: [{x:4,y:6},{x:4,y:11}], speed: 0.0175 },
      { x: 23, y: 11, path: [{x:23,y:11},{x:23,y:6}], speed: 0.0175 },
      { x: 13, y: 5, path: [{x:13,y:5},{x:13,y:12},{x:18,y:12},{x:18,y:5}], speed: 0.021 },
    ],
    lasers: [
      { x: 9, y: 4, angle: 0, rotationSpeed: 0.0084 },
      { x: 13, y: 4, angle: Math.PI/2, rotationSpeed: -0.0084 },
      { x: 17, y: 4, angle: Math.PI, rotationSpeed: 0.0084 },
      { x: 9, y: 7, angle: Math.PI*1.5, rotationSpeed: -0.0105 },
      { x: 13, y: 7, angle: 0, rotationSpeed: 0.0105 },
      { x: 17, y: 7, angle: Math.PI/2, rotationSpeed: -0.0105 },
      { x: 9, y: 10, angle: Math.PI, rotationSpeed: 0.0084 },
      { x: 13, y: 10, angle: Math.PI*1.5, rotationSpeed: -0.0084 },
      { x: 17, y: 10, angle: 0, rotationSpeed: 0.0084 },
    ],
    powerLinks: [{ panelPos: {x:4,y:2}, doorPos: {x:6,y:2} },{ panelPos: {x:23,y:2}, doorPos: {x:21,y:2} }],
  },
  // Levels 11-20: Intermediate challenges
  {
    id: 11, name: "Corridor Chase", description: "Navigate narrow corridors with drones.",
    width: 20, height: 16, playerStart: { x: 1, y: 8 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,1,1,1,0,0,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,1,1,1,0,0,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 5, y: 4, path: [{x:5,y:4},{x:15,y:4}], speed: 0.021 },
      { x: 14, y: 8, path: [{x:14,y:8},{x:4,y:8}], speed: 0.021 },
      { x: 5, y: 12, path: [{x:5,y:12},{x:15,y:12}], speed: 0.021 },
    ],
    lasers: [], powerLinks: [],
  },
  {
    id: 12, name: "Laser Grid", description: "Dense laser patterns everywhere.",
    width: 22, height: 16, playerStart: { x: 1, y: 1 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,2,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
      [1,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [],
    lasers: [
      { x: 4, y: 2, angle: 0, rotationSpeed: 0.014 },
      { x: 8, y: 2, angle: Math.PI/2, rotationSpeed: -0.014 },
      { x: 12, y: 2, angle: Math.PI, rotationSpeed: 0.014 },
      { x: 16, y: 2, angle: Math.PI*1.5, rotationSpeed: -0.014 },
      { x: 4, y: 5, angle: Math.PI/4, rotationSpeed: -0.0175 },
      { x: 8, y: 5, angle: Math.PI*3/4, rotationSpeed: 0.0175 },
      { x: 12, y: 5, angle: Math.PI*5/4, rotationSpeed: -0.0175 },
      { x: 16, y: 5, angle: Math.PI*7/4, rotationSpeed: 0.0175 },
      { x: 4, y: 8, angle: Math.PI/2, rotationSpeed: 0.0126 },
      { x: 8, y: 8, angle: 0, rotationSpeed: -0.0126 },
      { x: 12, y: 8, angle: Math.PI*1.5, rotationSpeed: 0.0126 },
      { x: 16, y: 8, angle: Math.PI, rotationSpeed: -0.0126 },
      { x: 4, y: 11, angle: 0, rotationSpeed: 0.0154 },
      { x: 8, y: 11, angle: Math.PI/2, rotationSpeed: -0.0154 },
      { x: 12, y: 11, angle: Math.PI, rotationSpeed: 0.0154 },
      { x: 16, y: 11, angle: Math.PI*1.5, rotationSpeed: -0.0154 },
      { x: 4, y: 14, angle: Math.PI/3, rotationSpeed: 0.0105 },
      { x: 8, y: 14, angle: Math.PI*2/3, rotationSpeed: -0.0105 },
      { x: 12, y: 14, angle: Math.PI*4/3, rotationSpeed: 0.0105 },
      { x: 16, y: 14, angle: Math.PI*5/3, rotationSpeed: -0.0105 },
    ],
    powerLinks: [],
  },
  {
    id: 13, name: "Triple Threat", description: "3 chips, heavy patrols.",
    width: 24, height: 18, playerStart: { x: 12, y: 16 }, totalChips: 3,
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 6, y: 3, path: [{x:6,y:3},{x:6,y:14},{x:17,y:14},{x:17,y:3}], speed: 0.0196 },
      { x: 12, y: 8, path: [{x:12,y:8},{x:12,y:1},{x:12,y:14}], speed: 0.021 },
      { x: 18, y: 12, path: [{x:18,y:12},{x:5,y:12},{x:5,y:4},{x:18,y:4}], speed: 0.0224 },
    ],
    lasers: [], powerLinks: [],
  },
  {
    id: 14, name: "Locked Sections", description: "Multiple doors, find all panels!",
    width: 26, height: 18, playerStart: { x: 1, y: 1 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,4,0,0,0,5,0,0,0,0,0,0,0,0,5,0,0,4,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,4,0,0,0,5,0,0,0,0,0,0,0,0,5,0,0,4,0,0,0,3,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 13, y: 9, path: [{x:13,y:9},{x:13,y:3},{x:13,y:14}], speed: 0.0175 },
      { x: 8, y: 7, path: [{x:8,y:7},{x:8,y:11},{x:18,y:11},{x:18,y:7}], speed: 0.0196 },
    ],
    lasers: [],
    powerLinks: [
      { panelPos: {x:3,y:3}, doorPos: {x:7,y:3} },
      { panelPos: {x:19,y:3}, doorPos: {x:16,y:3} },
      { panelPos: {x:3,y:14}, doorPos: {x:7,y:14} },
      { panelPos: {x:19,y:14}, doorPos: {x:16,y:14} },
    ],
  },
  {
    id: 15, name: "Parkour Master", description: "Jump across multiple gaps!",
    width: 26, height: 14, playerStart: { x: 1, y: 6 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,2,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,3,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 9, y: 4, path: [{x:9,y:4},{x:9,y:9}], speed: 0.021 },
      { x: 15, y: 9, path: [{x:15,y:9},{x:15,y:4}], speed: 0.021 },
      { x: 21, y: 4, path: [{x:21,y:4},{x:21,y:9}], speed: 0.021 },
    ],
    lasers: [], powerLinks: [],
    gaps: [
      { x1: 5, x2: 6, jumpDistance: 2 },
      { x1: 11, x2: 12, jumpDistance: 2 },
      { x1: 17, x2: 18, jumpDistance: 2 },
      { x1: 23, x2: 24, jumpDistance: 2 },
    ],
  },
  {
    id: 16, name: "Portal Maze", description: "Navigate through the portal network!",
    width: 22, height: 16, playerStart: { x: 1, y: 1 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,2,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,8,0,1,0,0,0,0,0,0,1,0,8,0,0,0,0,1],
      [1,1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,1,1,5,1,1,1,1,0,0,0,0,0,0,1],
      [1,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,1],
      [1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1,0,0,4,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 11, y: 5, path: [{x:11,y:5},{x:11,y:9}], speed: 0.0175 },
      { x: 4, y: 8, path: [{x:4,y:8},{x:18,y:8}], speed: 0.021 },
    ],
    lasers: [
      { emitterPos: {x:10,y:2}, direction: 'down', onDuration: 2000, offDuration: 1500 },
      { emitterPos: {x:12,y:13}, direction: 'up', onDuration: 2000, offDuration: 1500 },
    ],
    powerLinks: [{ panelPos: {x:10,y:11}, doorPos: {x:10,y:7} }],
    tunnels: [
      { entrance: {x:5,y:4}, exit: {x:16,y:4} },
      { entrance: {x:3,y:8}, exit: {x:17,y:8} },
    ],
  },
  {
    id: 17, name: "Precision Timing", description: "Lasers and drones combined!",
    width: 24, height: 16, playerStart: { x: 1, y: 7 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,0,0,6,0,0,0,0,0,6,0,0,0,1,1,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,2,0,0,0,0,6,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,6,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,1,1,0,0,0,6,0,0,0,0,0,6,0,0,0,1,1,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 8, y: 7, path: [{x:8,y:7},{x:15,y:7},{x:15,y:3},{x:8,y:3}], speed: 0.0224 },
      { x: 12, y: 11, path: [{x:12,y:11},{x:12,y:3}], speed: 0.021 },
    ],
    lasers: [
      { x: 8, y: 2, angle: 0, rotationSpeed: 0.0154 },
      { x: 14, y: 2, angle: Math.PI, rotationSpeed: -0.0154 },
      { x: 7, y: 5, angle: Math.PI/2, rotationSpeed: 0.014 },
      { x: 15, y: 5, angle: Math.PI*1.5, rotationSpeed: -0.014 },
      { x: 7, y: 9, angle: Math.PI/4, rotationSpeed: -0.0175 },
      { x: 15, y: 9, angle: Math.PI*3/4, rotationSpeed: 0.0175 },
      { x: 8, y: 12, angle: Math.PI*5/4, rotationSpeed: -0.0154 },
      { x: 14, y: 12, angle: Math.PI*7/4, rotationSpeed: 0.0154 },
    ],
    powerLinks: [],
  },
  {
    id: 18, name: "Four Corners", description: "Collect 4 chips from corners!",
    width: 28, height: 20, playerStart: { x: 14, y: 10 }, totalChips: 4,
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,0,2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 7, y: 5, path: [{x:7,y:5},{x:7,y:15},{x:20,y:15},{x:20,y:5}], speed: 0.0245 },
      { x: 14, y: 5, path: [{x:14,y:5},{x:14,y:15}], speed: 0.021 },
      { x: 21, y: 10, path: [{x:21,y:10},{x:6,y:10}], speed: 0.0224 },
    ],
    lasers: [], powerLinks: [],
  },
  {
    id: 19, name: "Spiral Descent", description: "Navigate the spiral maze carefully.",
    width: 24, height: 20, playerStart: { x: 2, y: 1 },
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],
      [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,0,2,0,0,0,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
      [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
    ],
    drones: [
      { x: 10, y: 3, path: [{x:10,y:3},{x:19,y:3}], speed: 0.0175 },
      { x: 12, y: 10, path: [{x:12,y:10},{x:12,y:9},{x:13,y:9},{x:13,y:11},{x:11,y:11},{x:11,y:10}], speed: 0.0154 },
      { x: 5, y: 17, path: [{x:5,y:17},{x:20,y:17}], speed: 0.0189 },
    ],
    lasers: [],
    powerLinks: [],
  },
  {
    id: 20, name: "The Arena", description: "Collect both chips in the arena!",
    width: 26, height: 18, playerStart: { x: 1, y: 8 }, totalChips: 2,
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,6,0,6,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,6,0,6,0,1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,0,1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,3,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    drones: [
      { x: 13, y: 8, path: [{x:13,y:8},{x:13,y:5},{x:16,y:5},{x:16,y:11},{x:10,y:11},{x:10,y:5}], speed: 0.0245 },
      { x: 13, y: 8, path: [{x:13,y:8},{x:10,y:8},{x:10,y:5},{x:16,y:5},{x:16,y:11}], speed: 0.0224 },
    ],
    lasers: [
      { x: 12, y: 6, angle: 0, rotationSpeed: 0.0175 },
      { x: 14, y: 6, angle: Math.PI, rotationSpeed: -0.0175 },
      { x: 12, y: 10, angle: Math.PI/2, rotationSpeed: -0.0175 },
      { x: 14, y: 10, angle: Math.PI*1.5, rotationSpeed: 0.0175 },
    ],
    powerLinks: [],
  },
];

const createAudioContext = () => {
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
};

const NeonCourier = () => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const gameLoopRef = useRef(null);
  const bgMusicRef = useRef(null);

  const [gameState, setGameState] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [chipsCollected, setChipsCollected] = useState(0);
  const [chipsRequired, setChipsRequired] = useState(1);
  const [collectedChipPositions, setCollectedChipPositions] = useState(new Set());
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('neonCourierScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [completedLevels, setCompletedLevels] = useState(() => {
    const saved = localStorage.getItem('neonCourierCompletedLevels');
    return saved ? JSON.parse(saved) : [];
  });
  const [message, setMessage] = useState('');
  const [isJumping, setIsJumping] = useState(false);
  const [inTunnel, setInTunnel] = useState(false);
  const [alertFlash, setAlertFlash] = useState(false);
  
  const playerRef = useRef({ x: 0, y: 0 });
  const dronesRef = useRef([]);
  const lasersRef = useRef([]);
  const activatedPanelsRef = useRef(new Set());
  const keysRef = useRef({});
  const chipsCollectedRef = useRef(0);
  const chipsRequiredRef = useRef(1);
  const collectedChipPositionsRef = useRef(new Set());
  const gameStateRef = useRef('menu');
  const isJumpingRef = useRef(false);
  const jumpTargetRef = useRef(null);
  const inTunnelRef = useRef(false);
  const jumpCooldownRef = useRef(false);
  const spaceWasPressedRef = useRef(false);
  
  useEffect(() => { chipsCollectedRef.current = chipsCollected; }, [chipsCollected]);
  useEffect(() => { chipsRequiredRef.current = chipsRequired; }, [chipsRequired]);
  useEffect(() => { collectedChipPositionsRef.current = collectedChipPositions; }, [collectedChipPositions]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { isJumpingRef.current = isJumping; }, [isJumping]);
  useEffect(() => { inTunnelRef.current = inTunnel; }, [inTunnel]);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('neonCourierScore', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('neonCourierCompletedLevels', JSON.stringify(completedLevels));
  }, [completedLevels]);

  const isLevelUnlocked = useCallback((idx) => {
    return idx === 0 || completedLevels.includes(idx - 1);
  }, [completedLevels]);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playBgMusic = useCallback(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('/vicious-machines-384186.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.5;
    }
    bgMusicRef.current.play().catch(err => console.log('Audio play failed:', err));
  }, []);

  const stopBgMusic = useCallback(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }
  }, []);

  const playAmbient = useCallback(() => {
    playBgMusic();
  }, [playBgMusic]);

  const playSound = useCallback((type) => {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'pickup') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    } else if (type === 'deliver') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    } else if (type === 'panel') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    } else if (type === 'caught') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    } else if (type === 'jump') {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    } else if (type === 'locked') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    } else {
      return;
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, [initAudio]);

  const stopAudio = useCallback(() => {
    oscillatorsRef.current.forEach(o => {
      try {
        o.stop();
      } catch(e) {
        // Oscillator already stopped
      }
    });
    oscillatorsRef.current = [];
    stopBgMusic();
  }, [stopBgMusic]);

  const loadLevel = useCallback((idx) => {
    const level = LEVELS[idx];
    if (!level) return;

    playerRef.current = {
      x: level.playerStart.x * TILE_SIZE + TILE_SIZE / 2,
      y: level.playerStart.y * TILE_SIZE + TILE_SIZE / 2
    };

    dronesRef.current = level.drones.map(d => ({
      ...d,
      currentX: d.x * TILE_SIZE + TILE_SIZE / 2,
      currentY: d.y * TILE_SIZE + TILE_SIZE / 2,
      pathIndex: 0,
      isChasing: false,
      alertTimer: 0,
      originalSpeed: d.speed
    }));

    lasersRef.current = level.lasers.map(l => ({ ...l, currentAngle: l.angle }));
    activatedPanelsRef.current = new Set();
    jumpCooldownRef.current = false;
    spaceWasPressedRef.current = false;
    isJumpingRef.current = false;

    const totalChips = level.totalChips || 1;
    setChipsRequired(totalChips);
    setChipsCollected(0);
    setCollectedChipPositions(new Set());
    chipsCollectedRef.current = 0;
    chipsRequiredRef.current = totalChips;
    collectedChipPositionsRef.current = new Set();

    setMessage(level.description);
    setIsJumping(false);
    setInTunnel(false);
    setAlertFlash(false);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const checkWallCollision = useCallback((x, y, level) => {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    if (tileX < 0 || tileX >= level.width || tileY < 0 || tileY >= level.height) {
      return true;
    }

    const tile = level.map[tileY][tileX];

    if (tile === TILES.DOOR) {
      return !level.powerLinks?.some(link =>
        link.doorPos.x === tileX &&
        link.doorPos.y === tileY &&
        activatedPanelsRef.current.has(`${link.panelPos.x},${link.panelPos.y}`)
      );
    }

    if (tile === TILES.GAP && !isJumpingRef.current) {
      return true;
    }

    return tile === TILES.WALL;
  }, []);

  const checkLaserCollision = useCallback((px, py) => {
    for (const laser of lasersRef.current) {
      const lx = laser.x * TILE_SIZE + TILE_SIZE/2, ly = laser.y * TILE_SIZE + TILE_SIZE/2;
      const ex = lx + Math.cos(laser.currentAngle) * TILE_SIZE * 2.5, ey = ly + Math.sin(laser.currentAngle) * TILE_SIZE * 2.5;
      const dx = ex - lx, dy = ey - ly, len = Math.sqrt(dx*dx + dy*dy);
      const t = Math.max(0, Math.min(1, ((px - lx) * dx + (py - ly) * dy) / (len * len)));
      if ((px - (lx + t * dx)) ** 2 + (py - (ly + t * dy)) ** 2 < (PLAYER_SIZE/2 + 3) ** 2) return true;
    }
    return false;
  }, []);

  const gameLoop = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    const level = LEVELS[currentLevel]; if (!level) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const player = playerRef.current, keys = keysRef.current;

    if (isJumpingRef.current && jumpTargetRef.current) {
      const dx = jumpTargetRef.current.x - player.x, dy = jumpTargetRef.current.y - player.y, dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 5) { player.x = jumpTargetRef.current.x; player.y = jumpTargetRef.current.y; isJumpingRef.current = false; setIsJumping(false); jumpTargetRef.current = null; jumpCooldownRef.current = true; setTimeout(() => { jumpCooldownRef.current = false; }, 214); }
      else { player.x += dx * 0.28; player.y += dy * 0.28; }
    } else if (!inTunnelRef.current) {
      let vx = 0, vy = 0;
      if (keys['w'] || keys['arrowup']) vy = -2.1; if (keys['s'] || keys['arrowdown']) vy = 2.1;
      if (keys['a'] || keys['arrowleft']) vx = -2.1; if (keys['d'] || keys['arrowright']) vx = 2.1;
      if (vx && vy) { vx *= 0.707; vy *= 0.707; }
      const hs = PLAYER_SIZE / 2;
      if (!checkWallCollision(player.x + vx - hs, player.y - hs, level) && !checkWallCollision(player.x + vx + hs, player.y - hs, level) && !checkWallCollision(player.x + vx - hs, player.y + hs, level) && !checkWallCollision(player.x + vx + hs, player.y + hs, level)) player.x += vx;
      if (!checkWallCollision(player.x - hs, player.y + vy - hs, level) && !checkWallCollision(player.x + hs, player.y + vy - hs, level) && !checkWallCollision(player.x - hs, player.y + vy + hs, level) && !checkWallCollision(player.x + hs, player.y + vy + hs, level)) player.y += vy;
    }

    const DR = TILE_SIZE * 2.5;
    dronesRef.current.forEach(drone => {
      const dx = player.x - drone.currentX, dy = player.y - drone.currentY, dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < DR && !inTunnelRef.current && !drone.isChasing) { drone.isChasing = true; drone.alertTimer = 30; setAlertFlash(true); playSound('panel'); setMessage('⚠️ DETECTED!'); setTimeout(() => setMessage(''), 1500); }
      if (drone.alertTimer > 0) { drone.alertTimer--; if (drone.alertTimer === 0) setAlertFlash(false); }
      if (drone.isChasing && !inTunnelRef.current) { const cs = drone.originalSpeed * 2.5 * TILE_SIZE; if (dist > 5) { drone.currentX += (dx / dist) * cs; drone.currentY += (dy / dist) * cs; } if (dist > DR * 2.5) drone.isChasing = false; }
      else if (!drone.isChasing && drone.path.length >= 2) { const t = drone.path[drone.pathIndex], tx = t.x * TILE_SIZE + TILE_SIZE/2, ty = t.y * TILE_SIZE + TILE_SIZE/2, tdx = tx - drone.currentX, tdy = ty - drone.currentY, td = Math.sqrt(tdx*tdx + tdy*tdy); if (td < 2) drone.pathIndex = (drone.pathIndex + 1) % drone.path.length; else { drone.currentX += (tdx / td) * drone.originalSpeed * TILE_SIZE; drone.currentY += (tdy / td) * drone.originalSpeed * TILE_SIZE; } }
    });

    lasersRef.current.forEach(l => { l.currentAngle += l.rotationSpeed; });

    if (!inTunnelRef.current) { for (const d of dronesRef.current) { if (Math.sqrt((player.x - d.currentX) ** 2 + (player.y - d.currentY) ** 2) < (PLAYER_SIZE + DRONE_SIZE) / 2) { playSound('caught'); setMessage('Caught!'); setTimeout(() => loadLevel(currentLevel), 1000); return; } } }
    if (!isJumpingRef.current && !inTunnelRef.current && checkLaserCollision(player.x, player.y)) { playSound('caught'); setMessage('Laser hit!'); setTimeout(() => loadLevel(currentLevel), 1000); return; }

    const tx = Math.floor(player.x / TILE_SIZE), ty = Math.floor(player.y / TILE_SIZE), tile = level.map[ty]?.[tx];
    if (tile === TILES.PICKUP) { const ck = `${tx},${ty}`; if (!collectedChipPositionsRef.current.has(ck)) { const nc = new Set(collectedChipPositionsRef.current); nc.add(ck); collectedChipPositionsRef.current = nc; setCollectedChipPositions(nc); chipsCollectedRef.current++; setChipsCollected(chipsCollectedRef.current); playSound('pickup'); setMessage(chipsCollectedRef.current >= chipsRequiredRef.current ? 'All chips! Deliver!' : `Chip ${chipsCollectedRef.current}/${chipsRequiredRef.current}`); setTimeout(() => setMessage(''), 2000); } }
    if (tile === TILES.DELIVERY && chipsCollectedRef.current >= chipsRequiredRef.current) { playSound('deliver'); const ls = 100 + (chipsRequiredRef.current - 1) * 50; setScore(s => s + ls); setCompletedLevels(c => [...new Set([...c, currentLevel])]); setGameState('levelComplete'); setMessage(`+${ls} pts!`); }
    if (tile === TILES.POWER_PANEL && keys['e']) { const pk = `${tx},${ty}`; if (!activatedPanelsRef.current.has(pk)) { activatedPanelsRef.current.add(pk); playSound('panel'); setMessage('Power on!'); setTimeout(() => setMessage(''), 2000); } }
    if ((tile === TILES.TUNNEL_ENTRANCE || tile === TILES.TUNNEL_EXIT) && keys['e'] && !inTunnelRef.current) { const tn = level.tunnels?.find(t => (t.entrance.x === tx && t.entrance.y === ty) || (t.exit.x === tx && t.exit.y === ty)); if (tn) { setInTunnel(true); playSound('panel'); const isAtEntrance = tn.entrance.x === tx && tn.entrance.y === ty; const targetPos = isAtEntrance ? tn.exit : tn.entrance; setTimeout(() => { player.x = targetPos.x * TILE_SIZE + TILE_SIZE/2; player.y = targetPos.y * TILE_SIZE + TILE_SIZE/2; setInTunnel(false); }, 357); } }

    const sp = keys[' '], cj = sp && !spaceWasPressedRef.current && !isJumpingRef.current && !jumpCooldownRef.current && level.gaps;
    spaceWasPressedRef.current = sp;
    if (cj) { for (const g of level.gaps) { const pr = player.x + PLAYER_SIZE/2, pl = player.x - PLAYER_SIZE/2, gs = g.x1 * TILE_SIZE, ge = (g.x2 + 1) * TILE_SIZE; if (pr >= gs - TILE_SIZE/2 && pr <= gs + TILE_SIZE/4) { isJumpingRef.current = true; setIsJumping(true); jumpTargetRef.current = { x: ge + TILE_SIZE/2 + PLAYER_SIZE/2, y: player.y }; playSound('jump'); break; } else if (pl <= ge + TILE_SIZE/2 && pl >= ge - TILE_SIZE/4) { isJumpingRef.current = true; setIsJumping(true); jumpTargetRef.current = { x: gs - TILE_SIZE/2 - PLAYER_SIZE/2, y: player.y }; playSound('jump'); break; } } }

    render(ctx, level);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [currentLevel, checkWallCollision, checkLaserCollision, loadLevel, playSound]);

  const render = useCallback((ctx, level) => {
    ctx.fillStyle = '#0a0a12'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const player = playerRef.current;
    for (let y = 0; y < level.height; y++) for (let x = 0; x < level.width; x++) {
      const t = level.map[y][x], px = x * TILE_SIZE, py = y * TILE_SIZE;
      if (t === TILES.WALL) { ctx.fillStyle = '#1a1a2e'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); ctx.strokeStyle = '#4a4a6a'; ctx.lineWidth = 1; ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2); }
      else if (t === TILES.EMPTY) { ctx.fillStyle = '#12121f'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); }
      else if (t === TILES.PICKUP) { ctx.fillStyle = '#12121f'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); if (!collectedChipPositionsRef.current.has(`${x},${y}`)) { const g = Math.sin(Date.now() / 200) * 0.3 + 0.7; ctx.fillStyle = `rgba(0, 255, 200, ${g})`; ctx.beginPath(); ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, 6, 0, Math.PI * 2); ctx.fill(); } }
      else if (t === TILES.DELIVERY) { ctx.fillStyle = '#12121f'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); const ac = chipsCollectedRef.current >= chipsRequiredRef.current, dg = Math.sin(Date.now() / 300) * 0.3 + 0.7; ctx.strokeStyle = ac ? `rgba(255, 200, 0, ${dg})` : '#4a4a2a'; ctx.lineWidth = 2; ctx.strokeRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6); }
      else if (t === TILES.POWER_PANEL) { ctx.fillStyle = '#12121f'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); const ia = activatedPanelsRef.current.has(`${x},${y}`); ctx.fillStyle = ia ? '#00ff00' : '#004400'; ctx.fillRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12); }
      else if (t === TILES.DOOR) { const dl = level.powerLinks?.find(l => l.doorPos.x === x && l.doorPos.y === y), op = dl && activatedPanelsRef.current.has(`${dl.panelPos.x},${dl.panelPos.y}`); ctx.fillStyle = op ? '#12121f' : '#552222'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); if (!op) { ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 2; ctx.strokeRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4); } }
      else if (t === TILES.GAP) { ctx.fillStyle = '#050508'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); }
      else if (t === TILES.TUNNEL_ENTRANCE || t === TILES.TUNNEL_EXIT) { ctx.fillStyle = '#12121f'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); const tg = Math.sin(Date.now() / 250) * 0.3 + 0.7; ctx.fillStyle = `rgba(100, 100, 255, ${tg * 0.3})`; ctx.beginPath(); ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = `rgba(150, 150, 255, ${tg})`; ctx.lineWidth = 2; ctx.stroke(); }
      else if (t === TILES.LASER_EMITTER) { ctx.fillStyle = '#12121f'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); ctx.fillStyle = '#331111'; ctx.beginPath(); ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, 6, 0, Math.PI * 2); ctx.fill(); }
    }
    lasersRef.current.forEach(l => { const lx = l.x * TILE_SIZE + TILE_SIZE/2, ly = l.y * TILE_SIZE + TILE_SIZE/2, ex = lx + Math.cos(l.currentAngle) * TILE_SIZE * 2.5, ey = ly + Math.sin(l.currentAngle) * TILE_SIZE * 2.5; ctx.strokeStyle = 'rgba(255, 50, 50, 0.3)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(ex, ey); ctx.stroke(); ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(ex, ey); ctx.stroke(); ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill(); });
    dronesRef.current.forEach(d => { const ia = d.alertTimer > 0, pa = ia ? (Math.sin(Date.now() / 50) * 0.5 + 0.5) : 1; ctx.fillStyle = d.isChasing ? `rgba(255, 50, 50, ${0.15 + pa * 0.1})` : 'rgba(255, 100, 100, 0.1)'; ctx.beginPath(); ctx.arc(d.currentX, d.currentY, TILE_SIZE * 2.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = d.isChasing ? '#ff2222' : (ia ? '#ffaa00' : '#ff4444'); ctx.beginPath(); ctx.arc(d.currentX, d.currentY, DRONE_SIZE/2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = d.isChasing ? '#ffff00' : '#ffffff'; ctx.beginPath(); ctx.arc(d.currentX, d.currentY, 4, 0, Math.PI * 2); ctx.fill(); const sa = d.isChasing ? Math.atan2(player.y - d.currentY, player.x - d.currentX) : Date.now() / 500; ctx.strokeStyle = d.isChasing ? 'rgba(255, 50, 50, 0.8)' : 'rgba(255, 100, 100, 0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(d.currentX, d.currentY); ctx.lineTo(d.currentX + Math.cos(sa) * TILE_SIZE * 0.8, d.currentY + Math.sin(sa) * TILE_SIZE * 0.8); ctx.stroke(); if (d.isChasing) { ctx.fillStyle = '#ffff00'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.fillText('!', d.currentX, d.currentY - DRONE_SIZE/2 - 6); } });
    if (!inTunnelRef.current) { ctx.fillStyle = 'rgba(0, 200, 255, 0.2)'; ctx.beginPath(); ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = isJumpingRef.current ? '#88ffff' : '#00c8ff'; ctx.beginPath(); ctx.arc(player.x, player.y, PLAYER_SIZE/2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(player.x, player.y - 2, 2, 0, Math.PI * 2); ctx.fill(); if (chipsCollectedRef.current > 0) { const cg = Math.sin(Date.now() / 150) * 0.5 + 0.5; ctx.fillStyle = `rgba(0, 255, 200, ${cg})`; for (let i = 0; i < chipsCollectedRef.current; i++) { ctx.beginPath(); ctx.arc(player.x + (i - (chipsCollectedRef.current - 1) / 2) * 8, player.y + PLAYER_SIZE/2 + 5, 3, 0, Math.PI * 2); ctx.fill(); } } }
  }, []);

  useEffect(() => {
    const kd = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === 'Escape') { if (gameState === 'playing') setGameState('paused'); else if (gameState === 'paused') setGameState('playing'); }
      if (gameState === 'paused') { if (e.key.toLowerCase() === 'r') { loadLevel(currentLevel); setGameState('playing'); } else if (e.key.toLowerCase() === 'm') { setGameState('menu'); stopAudio(); } }
      if (gameState === 'levelComplete') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (currentLevel < LEVELS.length - 1) nextLevel(); } else if (e.key.toLowerCase() === 'r') startLevel(currentLevel); else if (e.key.toLowerCase() === 'm') { setGameState('menu'); stopAudio(); } }
      if (gameState === 'menu' && e.key === 'Enter') { e.preventDefault(); startLevel(0); }
    };
    const ku = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, [gameState, currentLevel, loadLevel, stopAudio]);

  useEffect(() => {
    if (gameState === 'playing') { playAmbient(); gameLoopRef.current = requestAnimationFrame(gameLoop); }
    else { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); if (gameState === 'menu') stopAudio(); }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, gameLoop, playAmbient, stopAudio]);

  const handleDevUnlock = useCallback(() => {
    const password = prompt('Enter dev password:');
    if (password === '3Ilovecooking,eating,reading9988') {
      const allLevels = LEVELS.map((_, i) => i);
      setCompletedLevels(allLevels);
      setMessage('✅ All levels unlocked!');
      setTimeout(() => setMessage(''), 2000);
      playSound('deliver');
    } else {
      setMessage('❌ Incorrect password');
      setTimeout(() => setMessage(''), 2000);
      playSound('locked');
    }
  }, [playSound]);

  const handleClearProgress = useCallback(() => {
    if (confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
      localStorage.removeItem('neonCourierScore');
      localStorage.removeItem('neonCourierCompletedLevels');
      setScore(0);
      setCompletedLevels([]);
      setMessage('🗑️ Progress cleared!');
      setTimeout(() => setMessage(''), 2000);
      playSound('locked');
    }
  }, [playSound]);

  const startLevel = useCallback((idx) => {
    if (!isLevelUnlocked(idx)) {
      playSound('locked');
      setMessage('🔒 Complete previous level first!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    setCurrentLevel(idx);
    loadLevel(idx);
    setGameState('playing');
    setAlertFlash(false);
  }, [loadLevel, isLevelUnlocked, playSound]);

  const nextLevel = useCallback(() => {
    if (currentLevel < LEVELS.length - 1) {
      startLevel(currentLevel + 1);
    } else {
      setMessage('🎉 All levels complete!');
      setGameState('menu');
    }
  }, [currentLevel, startLevel]);

  const level = LEVELS[currentLevel];
  const cw = level ? level.width * TILE_SIZE : 640, ch = level ? level.height * TILE_SIZE : 480;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-2">
      {/* Buy Me a Coffee - Sponsor Links */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <a
          href="https://buymeacoffee.com/hanryckbrar"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-3 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
          style={{ boxShadow: '0 0 15px rgba(251, 191, 36, 0.5)' }}
        >
          <span>☕</span>
          <span>Support</span>
        </a>
        <a
          href="https://buymeacoffee.com/hanryckbrar/extras"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-3 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
          style={{ boxShadow: '0 0 15px rgba(0, 200, 255, 0.5)' }}
        >
          <span>🤖</span>
          <span>Learn how to build this game with AI</span>
        </a>
      </div>

      <h1 className="text-2xl font-bold mb-1 tracking-wider" style={{ textShadow: '0 0 10px #00c8ff', color: '#00ffff' }}>NEON COURIER</h1>
      {gameState !== 'menu' && (
        <div className="flex gap-4 mb-1 text-xs">
          <div className="text-cyan-400">LEVEL: {currentLevel + 1}/{LEVELS.length}</div>
          <div className="text-yellow-400">SCORE: {score}</div>
          <div className={chipsCollected >= chipsRequired ? 'text-emerald-400' : 'text-gray-500'}>CHIPS: {chipsCollected}/{chipsRequired}</div>
        </div>
      )}
      <div className="relative" style={{ boxShadow: alertFlash ? '0 0 50px rgba(255, 50, 50, 0.8)' : '0 0 20px rgba(0, 200, 255, 0.3)', border: alertFlash ? '2px solid #ff3333' : '2px solid #0088aa' }}>
        <canvas ref={canvasRef} width={cw} height={ch} className="block" />
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-2 overflow-y-auto">
            <div className="text-cyan-300 text-sm mb-2">Select Mission</div>
            <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto mb-2">
              {LEVELS.map((l, i) => { const u = isLevelUnlocked(i), c = completedLevels.includes(i); return (
                <button key={l.id} onClick={() => startLevel(i)} disabled={!u} className={`px-2 py-1 rounded text-left text-xs ${!u ? 'bg-gray-800/50 border-gray-600 opacity-50 cursor-not-allowed' : c ? 'bg-emerald-900/50 border-emerald-500 hover:bg-emerald-800/50' : 'bg-cyan-900/50 border-cyan-500 hover:bg-cyan-800/50'} border`}>
                  <div className="font-bold">{!u && '🔒 '}{c && '✓ '}{l.name}</div>
                  <div className="text-gray-400">{u ? (c ? 'Complete' : 'Available') : 'Locked'}</div>
                </button>
              ); })}
            </div>
            <div className="text-gray-500 text-xs mb-2">WASD/Arrows • E interact • Space jump • ESC pause</div>
            <div className="flex gap-2">
              <button onClick={handleDevUnlock} className="px-3 py-1 bg-purple-900/50 border border-purple-500 hover:bg-purple-800/50 rounded text-xs">Dev</button>
              <button onClick={handleClearProgress} className="px-3 py-1 bg-red-900/50 border border-red-500 hover:bg-red-800/50 rounded text-xs">Clear Progress</button>
            </div>
          </div>
        )}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <div className="text-cyan-300 text-xl mb-4">PAUSED</div>
            <button onClick={() => setGameState('playing')} className="px-4 py-1 bg-cyan-600 hover:bg-cyan-500 rounded mb-2 text-sm">Resume [ESC]</button>
            <button onClick={() => { loadLevel(currentLevel); setGameState('playing'); }} className="px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded mb-2 text-sm">Restart [R]</button>
            <button onClick={() => { setGameState('menu'); stopAudio(); }} className="px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">Menu [M]</button>
          </div>
        )}
        {gameState === 'levelComplete' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <div className="text-emerald-400 text-xl mb-1">DELIVERY COMPLETE</div>
            <div className="text-yellow-400 mb-4">Score: {score}</div>
            {currentLevel < LEVELS.length - 1 ? <button onClick={nextLevel} className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 rounded mb-2 text-sm animate-pulse">Next Mission [Enter]</button> : <div className="text-cyan-300 mb-2">🎉 All complete!</div>}
            <button onClick={() => startLevel(currentLevel)} className="px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded mb-2 text-sm">Replay [R]</button>
            <button onClick={() => { setGameState('menu'); stopAudio(); }} className="px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">Menu [M]</button>
          </div>
        )}
        {message && gameState === 'playing' && <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1 rounded text-cyan-300 text-xs">{message}</div>}
      </div>
      <div className="mt-2 text-gray-500 text-xs flex gap-3">
        <span>🔵 You</span><span>🔴 Drone</span><span>🟢 Panel</span><span style={{color:'#00ffc8'}}>◆ Chip</span><span style={{color:'#ffcc00'}}>□ Delivery</span>
      </div>
    </div>
  );
};

export default NeonCourier;
