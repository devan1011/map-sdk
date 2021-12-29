import { World } from "./world";

import { LightSnowWeather } from "../weather/light-snow";
import { SnowWeather } from "../weather/snow";
import { RainWeather } from "../weather/rain";

export interface WeatherType {
  setup(world: World): void;
  update(world: World, dt: number): void;
  dispose(): void;
}

export class Weather {
  private world?: World;
  private types: Record<string, WeatherType>;
  private activeType: WeatherType

  constructor() {
    this.types = {
      'light-snow': new SnowWeather({ strength: 0.5 }),
      'heavy-snow': new SnowWeather({ strength: 1 }),
      'light-rain': new RainWeather({ strength: 0.5 }),
      'heavy-rain': new RainWeather({ strength: 1 }),
    };

    this.activeType = this.types['light-rain'];

    window.weatherTypes = this.types;
    window.changeWeather = this.change;
  }

  public change(type: WeatherType) {
    this.activeType.dispose();
    this.activeType = type;

    if (this.world) {
      this.activeType.setup(this.world);
    }
  }

  public setup(world: World): void {
    this.world = world;

    this.activeType?.setup(world);
  }

  public update(world: World, dt: number): void {
    this.activeType.update(world, dt);
  }

  public dispose() {
    this.activeType.dispose();
  }
}
