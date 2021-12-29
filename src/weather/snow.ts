import { TextureLoader, Vector3 } from "three";
import type { WeatherType } from "../classes/weather";
import { ParticleSystem } from "../classes/particles";
import { World } from "../classes/world";

import pointTex from "../assets/textures/particles-single.png"
import splatTex from "../assets/textures/splat-4.png"

export class SnowWeather implements WeatherType {
  private particleSystem: ParticleSystem;
  private particleSystem2: ParticleSystem;
  private particleSystem3: ParticleSystem;

  constructor({
    strength = 0.2,
  }: {
    strength: number,
  }) {
    this.particleSystem = new ParticleSystem({
      zone: {
        position: new Vector3(0, 0, 100),
        size:     new Vector3(500, 500, 200),
      },
      creationZones: [
        {
          position: new Vector3(-245, 0, 100),
          size:     new Vector3(10, 500, 200),
        },
        {
          position: new Vector3(245, 0, 100),
          size:     new Vector3(10, 500, 200),
        },
        {
          position: new Vector3(0, -245, 100),
          size:     new Vector3(500, 10, 200),
        },
        {
          position: new Vector3(0, 245, 100),
          size:     new Vector3(500, 10, 200),
        },
        // {
        //   position: new Vector3(0, 0, -245),
        //   size:     new Vector3(100, 100, 1),
        // },
        {
          position: new Vector3(0, 0, 195),
          size:     new Vector3(500, 500, 10),
        },
      ],
      startVelocity: new Vector3(0.1, -0.1, -0.2),
      startSize: 2,
      texture: new TextureLoader().load(pointTex),
      color: '#fff',
      opacity: 1,
      lifetime: 10000,
      limit: strength * 20000,
      brownianForce: 0.01,
    });
    this.particleSystem.debug = true;

    this.particleSystem2 = new ParticleSystem({
      zone: {
        position: new Vector3(0, 0, 0),
        size:     new Vector3(400, 400, 1),
      },
      startVelocity: new Vector3(),
      startSize: 20,
      brownianForce: 0,
      lifetime: 5,
      limit: strength * 1000,
      texture: new TextureLoader().load(splatTex),
      opacity: 0.2,
      color: '#fff',
    });

    this.particleSystem3 = new ParticleSystem({
      zone: {
        position: new Vector3(0, 0, 0),
        size:     new Vector3(1000, 1000, 2),
      },
      creationZones: [
        {
          position: new Vector3(-450, 0, 0),
          size:     new Vector3(100, 1000, 2),
        },
        {
          position: new Vector3(450, 0, 0),
          size:     new Vector3(100, 1000, 2),
        },
        {
          position: new Vector3(0, -450, 0),
          size:     new Vector3(1000, 100, 2),
        },
        {
          position: new Vector3(0, 450, 0),
          size:     new Vector3(1000, 100, 2),
        },
      ],
      startVelocity: new Vector3(0.1, -0.05, 0),
      startSize: 1000,
      brownianForce: 0,
      lifetime: 50000,
      limit: strength * 200,
      texture: new TextureLoader().load(splatTex),
      opacity: 0.2,
      color: '#aaa',
      shrinkOverTime: false,
    });
  }

  public setup(world: World): void {
    this.particleSystem.setup(world.view.origin, world.scene);
    this.particleSystem2.setup(world.view.origin, world.scene);
    this.particleSystem3.setup(world.view.origin, world.scene);
  }

  public update(world: World, dt: number): void {
    this.particleSystem.update(dt);
    this.particleSystem2.update(dt);
    this.particleSystem3.update(dt);
  }

  public dispose() {
    this.particleSystem.dispose();
    this.particleSystem2.dispose();
    this.particleSystem3.dispose();
  }
}
