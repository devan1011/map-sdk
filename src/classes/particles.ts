import { Box3, BoxGeometry, ColorRepresentation, Euler, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, Points, PointsMaterial, Quaternion, Scene, ShaderLib, ShaderMaterial, SphereGeometry, Texture, TextureLoader, Vector, Vector3, WireframeGeometry } from "three";

export interface Particle {
  age: number;
  size: number;
  position: Vector3;
  velocity: Vector3;
}

export interface Volume {
  position: Vector3;
  size:     Vector3;
}

export class ParticleSystem {
  public debug: boolean = false;

  public lifetime: number;
  public limit:    number;

  public startVelocity:   Vector3;
  public startSize:       number;
  public brownianForce:   number;

  public texture?: Texture;
  public opacity?: number;
  public color?:   ColorRepresentation;

  public shrinkOverTime?: boolean;
  
  private parent?:       Object3D;
  private zone:          Volume;
  private creationZones: Volume[];

  private particles: Particle[] = [];
  private particle:  InstancedMesh;

  private creationZonePercentage: number = 1;

  public constructor({
    zone,
    creationZones,
    startVelocity   = new Vector3(0.1, -0.1, -0.1),
    startSize       = 1,
    brownianForce   = 0.01,
    lifetime        = 10,
    limit           = 10000,
    texture         = undefined,
    opacity         = 1,
    color           = '0xffffff',
    shrinkOverTime  = true,
  }: {
    zone:             ParticleSystem['zone'],
    creationZones?:   ParticleSystem['creationZones'],
    startVelocity?:   ParticleSystem['startVelocity'],
    startSize?:       ParticleSystem['startSize'],
    brownianForce?:   ParticleSystem['brownianForce'],
    lifetime?:        ParticleSystem['lifetime'],
    limit?:           ParticleSystem['limit'],
    texture?:         ParticleSystem['texture'],
    opacity?:         ParticleSystem['opacity'],
    color?:           ParticleSystem['color'],
    shrinkOverTime?:  ParticleSystem['shrinkOverTime'],
  }) {
    this.zone           = zone;
    this.creationZones  = creationZones || [zone];
    this.startVelocity  = startVelocity;
    this.startSize      = startSize;
    this.brownianForce  = brownianForce;
    this.lifetime       = lifetime;
    this.limit          = limit;
    this.texture        = texture;
    this.opacity        = opacity;
    this.color          = color;
    this.shrinkOverTime = shrinkOverTime;

    this.particle = new InstancedMesh(
      new PlaneGeometry(),
      new MeshStandardMaterial({
        map: this.texture,
        color: this.color,
        // alphaMap: this.texture,
        transparent: true,
        opacity: this.opacity,
        // alphaTest: 10,
        depthTest: false,
      }),
      this.limit,
    );
    // this.particle.castShadow = true;

    this.updatePreComputed();
  }

  public setup(parent: Object3D, scene: Scene) {
    this.parent = parent;

    scene.add(this.particle);

    if (this.parent) {
      for (let i = 0; i < this.limit; i++) {
        this.createParticle(this.parent.localToWorld(
          this.randomPositionInVolume(this.zone),
        ));
      }
    }

    if (this.debug) {
      const mesh = new Mesh(
        new BoxGeometry(this.zone.size.x, this.zone.size.y, this.zone.size.z),
        new MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
        }),
      );
      mesh.visible = true;
      mesh.position.add(this.zone.position);
      parent.add(mesh);
  
      this.creationZones.forEach((zone) => {
        const mesh = new Mesh(
          new BoxGeometry(zone.size.x, zone.size.y, zone.size.z),
          new MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
          }),
        );
        mesh.visible = true;
        mesh.position.x = zone.position.x;
        mesh.position.y = zone.position.y;
        mesh.position.z = zone.position.z;
        parent.add(mesh);
      });
    }
  }

  public update(dt: number) {
    const aliveParticles: Particle[] = [];

    const creationCount = Math.floor((this.limit - this.particles.length) / this.creationZonePercentage);

    if (this.parent) {
      for (let i = 0; i < creationCount; i++) {
        this.createParticle(this.parent.localToWorld(
          this.randomPositionInVolumes(this.creationZones),
        ));
      }
    }

    const matrix  = new Matrix4();
    const euler   = new Euler();
    const quat    = new Quaternion().setFromEuler(euler);
    const vector  = new Vector3();
    const deadPos = new Vector3(0, 0, 10000);

    for (let i = 0; i < this.limit; i++) {
      const particle = this.particles[i];

      if (particle && this.parent && (
        particle.age > 0
        && this.volumeContainsPosition(
          this.zone,
          this.parent.worldToLocal(particle.position.clone()),
        )
      )) {
        particle.age -= dt;

        particle.velocity
          .add(vector
            .random()
            .multiplyScalar(this.brownianForce)
            .subScalar(this.brownianForce / 2)
          );

        particle.position.add(particle.velocity);

        if (this.shrinkOverTime) {
          particle.size = (particle.age / this.lifetime) * this.startSize;
        }

        matrix.compose(
          particle.position,
          quat,
          vector.setScalar(particle.size * 0.2),
        );

        aliveParticles.push(particle);
      } else {
        matrix.compose(
          deadPos,
          quat,
          vector,
        );
      }

      this.particle.updateMatrix();
      this.particle.setMatrixAt(i, matrix);
    }

    this.particle.instanceMatrix.needsUpdate = true;
    this.particles = aliveParticles;
  }

  public dispose() {
    this.particle.dispose();
  }

  private updatePreComputed() {
    this.creationZonePercentage = this.computeTotalVolumesSize(this.creationZones) / this.computeVolumeSize(this.zone);
  }

  private createParticle(position: Vector3): void {
    const size = this.startSize;

    if (this.parent !== undefined) {
      const particle: Particle = {
        age: this.lifetime * Math.random(),
        position: position,
        velocity: this.startVelocity.clone(),
        size,
      };

      this.particles.push(particle);
    }
  }

  private randomPositionInVolumes(volumes: Volume[]): Vector3 {
    const index = Math.floor(Math.random() * volumes.length);

    return this.randomPositionInVolume(volumes[index]);
  }

  private randomPositionInVolume(volume: Volume): Vector3 {
    return volume
      .position
      .clone()
      .sub(volume
        .size
        .clone()
        .divideScalar(2)
      )
      .add(new Vector3()
        .random()
        .multiply(volume.size)
      );
  }

  private computeTotalVolumesSize(volumes: Volume[]): number {
    return volumes.reduce((acc, volume) => acc + this.computeVolumeSize(volume), 0);
  }

  private computeVolumeSize(volume: Volume): number {
    return volume.size.x * volume.size.y * volume.size.z;
  }

  private volumeContainsPosition(volume: Volume, position: Vector3): boolean {
    return (
      volume.position.x - (volume.size.x / 2) <= position.x &&
      volume.position.y - (volume.size.y / 2) <= position.y &&
      volume.position.z - (volume.size.z / 2) <= position.z &&
      volume.position.x + (volume.size.x / 2) >= position.x &&
      volume.position.y + (volume.size.y / 2) >= position.y &&
      volume.position.z + (volume.size.z / 2) >= position.z
    );
  }
}
