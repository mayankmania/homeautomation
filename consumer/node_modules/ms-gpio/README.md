ms-gpio
==========

Manage Raspberry Pi GPIO pins with node.js & Raspbian (Linux) OS

## Setup

Raspbian OS must be preloaded/installed on Raspberry PI device. For installation refer [this page](https://www.raspberrypi.org/learning/software-guide/quickstart)

Latest version of node be installed on your Raspberry PI device, follow below steps to update node to latest version:
```
curl -sLS https://apt.adafruit.com/add | sudo bash
sudo apt-get install node
```

**ms-gpio** module can then be installed with npm:
```
npm install ms-gpio
```

## Usage
In order to work with Raspberry PI GPIOs, node application must run under root access.

Prior to reading or writing a GPIO pin, **setup** operation/function must be invoked. After this, read and write operation on a pin can be performed.

GPIO pins can be accessed ; either using the Raspberry Pi physical numbering or with BCM/SoC naming scheme . This module supports Raspberry Pi(BOARD) pin scheme, that is board pin number must be passed. Please see [this page](http://elinux.org/RPi_Low-level_peripherals) for more details.

## API
### Methods

#### setup(pinNo, direction)
Sets up a pin for read or write. It must be done before the pin can be used for either reading or writing
* pinNo : Reference to the GPIO pin
* direction: Pin direction can be set to **INPUT_MODE** for read mode or **OUTPUT_MODE** for write mode. If not passed, it defaults to OUTPUT_MODE

#### read(pinNo)
Reads the value of a pin, returns boolean value **true** for high voltage (ON) & **false** for low voltage (OFF).
* pinNo : Reference to the GPIO pin
* error : Prior to the read operation, setup operation must be performed. Else error is thrown from the method

#### write(pinNo, value)
Writes the value of a pin.
* pinNo : Reference to the GPIO pin
* value : A boolean value of **true** for high voltage (ON) & **false** for low voltage (OFF) must be passed
* error : Prior to the write operation, setup operation must be performed. Else error is thrown from the method

#### tearDown()
Unexports all the exported pins.

## Examples
### Setup and read the value of a pin
```js
var gpio = require('ms-gpio');
gpio.setUp(16, gpio.INPUT_MODE);
gpio.read(16);
```

### Setup and write to a pin
```js
var gpio = require('ms-gpio');
gpio.setUp(16, gpio.OUTPUT_MODE);
gpio.write(16,true); //Sets the GPIO to high
gpio.write(16,false); //Sets the GPIO to low

```

### Tear down the exported pin
```js
var gpio = require('ms-gpio');
gpio.tearDown();
```