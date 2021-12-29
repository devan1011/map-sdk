import { HemisphereLight, PointLight, Scene } from "three";

import { WorldRenderer } from "./renderer";
import { View } from "./view";
import { Map } from "./map";

import mapImage from '../assets/textures/map-2.png';
import { Weather } from "./weather";

export class World {
  private renderer: WorldRenderer;
  
  public scene:   Scene;
  public view:    View;
  public map:     Map;
  public weather: Weather;

  constructor(canvas?: HTMLCanvasElement) {
    this.scene = new Scene();

    this.renderer = new WorldRenderer(canvas);
    this.view     = new View();
    this.map      = new Map({ image: mapImage });
    this.weather  = new Weather();
  }

  public setCanvas(canvas: HTMLCanvasElement) {
    this.renderer.setup(canvas);
  }

  public setup(): void {
    this.view.setup(this);
    this.map.setup(this);
    this.weather.setup(this);

    // // const light = new PointLight(0xffee88, 1, 100, 2);
    // const light = new HemisphereLight(0xc9e2ff, 1, 1);
    // light.position.z = 10;
    // this.scene.add(light);

    this.renderer.loop(this.update.bind(this));
  }

  public update(dt: number) {
    this.view.update(this, dt);
    this.weather.update(this, dt);

    this.renderer.render(this.scene, this.view);
  }

  public dispose() {
    this.view.dispose(this);
    this.renderer.dispose();
  }
}
