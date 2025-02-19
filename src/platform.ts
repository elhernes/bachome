import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from "homebridge";

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { BachomeSwitchAccessory } from "./accessories/switch";
import { BachomeThermostatAccessory } from "./accessories/thermostat";
import { DzkZoneAccessory } from "./accessories/dzk-bacnet";
import { BachomeHeaterCoolerAccessory } from "./accessories/cooler";
import { BachomeTemperatureSensorAccessory } from "./accessories/temperatureSensor";

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class BachomeHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.log.debug("Finished initializing platform:", this.config.name);

    process.on("uncaughtException", (error) => {
      log.error(error.message);
      process.exit(1);
    });

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on("didFinishLaunching", () => {
      log.debug("Executed didFinishLaunching callback");
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info("Loading accessory from cache:", accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices(): void {
    // EXAMPLE ONLY
    // A real plugin you would discover accessories from the local network, cloud services
    // or a user-defined array in the platform config.
    if (this.config.switch) {
      for (const device of this.config.switch) {
        const uuid = this.api.hap.uuid.generate(device.serial);

        const existingAccessory = this.accessories.find(
          (accessory) => accessory.UUID === uuid
        );

        if (existingAccessory) {
          this.log.info(
            `Restoring existing accessory from cache: ${existingAccessory.displayName}`
          );

          new BachomeSwitchAccessory(this, existingAccessory);
        } else {
          this.log.info(`Adding new accessory: ${device.name}`);

          const accessory = new this.api.platformAccessory(device.name, uuid);

          accessory.context.device = device;

          new BachomeSwitchAccessory(this, accessory);

          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
            accessory,
          ]);
        }
      }
    }

    if (this.config.thermostat) {
      for (const device of this.config.thermostat) {
        const uuid = this.api.hap.uuid.generate(device.serial);

        const existingAccessory = this.accessories.find(
          (accessory) => accessory.UUID === uuid
        );

        if (existingAccessory) {
          this.log.info(
            `Restoring existing accessory from cache: ${existingAccessory.displayName}`
          );

          new BachomeThermostatAccessory(this, existingAccessory);
        } else {
          this.log.info(`Adding new accessory: ${device.name}`);

          const accessory = new this.api.platformAccessory(device.name, uuid);

          accessory.context.device = device;

          new BachomeThermostatAccessory(this, accessory);

          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
            accessory,
          ]);
        }
      }
    }

    if (this.config["dzk-bacnet"]) {
      this.log.info(`Found dzk-bacnet config`);
      for (const device of this.config["dzk-bacnet"].zones) {
        const uuid = this.api.hap.uuid.generate(
          "dzk-bacnet-zone-" + device.zone
        );

        const existingAccessory = this.accessories.find(
          (accessory) => accessory.UUID === uuid
        );

        if (existingAccessory) {
          this.log.info(
            `Restoring existing accessory from cache: ${existingAccessory.displayName}`
          );

          new DzkZoneAccessory(
            this,
            this.config["dzk-bacnet"],
            existingAccessory
          );
        } else {
          this.log.info(`Adding new accessory: ${device.name}`);

          const accessory = new this.api.platformAccessory(device.name, uuid);

          accessory.context.device = device;

          new DzkZoneAccessory(this, this.config["dzk-bacnet"], accessory);

          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
            accessory,
          ]);
        }
      }
    }

    if (this.config.cooler) {
      for (const device of this.config.cooler) {
        const uuid = this.api.hap.uuid.generate(device.serial);

        const existingAccessory = this.accessories.find(
          (accessory) => accessory.UUID === uuid
        );

        if (existingAccessory) {
          this.log.info(
            `Restoring existing accessory from cache: ${existingAccessory.displayName}`
          );

          new BachomeHeaterCoolerAccessory(this, existingAccessory);
        } else {
          this.log.info(`Adding new accessory: ${device.name}`);

          const accessory = new this.api.platformAccessory(device.name, uuid);

          accessory.context.device = device;

          new BachomeHeaterCoolerAccessory(this, accessory);

          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
            accessory,
          ]);
        }
      }
    }

    if (this.config.temperatureSensor) {
      for (const device of this.config.temperatureSensor) {
        const uuid = this.api.hap.uuid.generate(device.serial);

        const existingAccessory = this.accessories.find(
          (accessory) => accessory.UUID === uuid
        );

        if (existingAccessory) {
          this.log.info(
            `Restoring existing accessory from cache: ${existingAccessory.displayName}`
          );

          new BachomeTemperatureSensorAccessory(this, existingAccessory);
        } else {
          this.log.info(`Adding new accessory: ${device.name}`);

          const accessory = new this.api.platformAccessory(device.name, uuid);

          accessory.context.device = device;

          new BachomeTemperatureSensorAccessory(this, accessory);

          this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
            accessory,
          ]);
        }
      }
    }
  }
}
