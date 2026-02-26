# Creality K2 Plus WebSocket Reverse Engineering

A partial documentation of Creality's proprietary WebSocket protocol, enabling enhanced control and monitoring of Creality printers.

This documentation is based on reverse engineering of the printer's firmware `(/usr/bin/web-server)` and trial-and-error. It is not officially documented by Creality and may change with future firmware updates. Use at your own risk.

This might work on all K2 Printers or even all Creality Printers but I could only verify this on a K2 Plus on Version 1.1.3.13.

## Table of Contents
- [Overview](#overview)
- [Proof of Concept: CFS Status in Fluidd](#proof-of-concept-cfs-status-in-fluidd)
- [WebSocket Protocol Documentation](#websocket-protocol-documentation)
- [Command Reference](#command-reference)
- [Example](#example)

## Overview

Creality uses a proprietary WebSocket protocol on port `9999` for communication between Creality Print and the printer. This protocol handles:

**In the Preview Tab:**
- Sending print jobs
- Enabling/disabling print calibration
- Color/spool mapping
- Starting prints with Creality's internal commands

**In the Device Tab:**
- CFS (Creality Filament System) management
  - Temperature and humidity monitoring
  - Auto refill status
  - Filament loading/unloading
  - Spool settings management
  - RFID spool tracking

## Proof of Concept: CFS Status in Fluidd

I've created a JavaScript bookmarklet that injects real-time CFS status into your Fluidd dashboard by replacing the "Runout Sensors" card.

### Current Capabilities

- Show CFS connection status
- Display temperature and humidity
- Show currently loaded filament
- Per-spool information:
  - Filament color
  - Material type
  - Remaining filament percentage (RFID spools only)

### Installation Methods

#### Method 1: Easy (Hosted Script)
*Warning: This fetches a script from `https://davibe92.github.io/k2-websocket-re/k2_cfs_sync.js`. After loading, all traffic stays on your local network. The script could change or break at any time. Review the script if you have security concerns.*

1. Create a new bookmark with this URL:
   ```javascript
   javascript:(function(){var s=document.createElement('script');s.src='https://davibe92.github.io/k2-websocket-re/k2_cfs_sync.js';document.body.appendChild(s);})();
   ```

2. Open your printer's Fluidd interface
3. Click the three-dot menu (top right) → "Adjust dashboard layout"
4. Enable "Runout Sensors" checkbox
5. Click "Set as default layout" → "Exit layout mode"
6. Click the bookmark while on the fluidd dashboard
7. The "Runout Sensor" card will transform into "CFS Status"!

#### Method 2: Self-Hosted (Local)
*If wou dont trust a script hosted online or its broken*

1. Install Python if you havent already (or use any other way to localy host a file)
2. Download [`k2_cfs_sync.js`](https://github.com/DaviBe92/k2-websocket-re/blob/main/k2_cfs_sync.js)
3. Start a local HTTP server in the folder the script is in:
   ```bash
   python -m http.server 8000
   ```
4. Create a bookmark with:
   ```javascript
   javascript:(function(){var s=document.createElement('script');s.src='http://localhost:8000/k2_cfs_sync.js';document.body.appendChild(s);})();
   ```
5. Follow steps 2-7 from Method 1

> **Note:** You need to click the bookmark after every page reload!

## WebSocket Protocol Documentation

### Connection Details
```
WebSocket Port: 9999
Connection URL: ws://<printer.ip>:9999
```

### Initial Connection Response

Upon connecting, the printer automatically sends a complete status dump:

<details>
<summary>🔽 Click to expand initial connection payload</summary>

```json
{
    "TotalLayer": 0,
    "accelToDecelLimits": 30000,
    "accelerationLimits": 30000,
    "aiDetection": 0,
    "aiFirstFloor": 0,
    "aiPausePrint": 0,
    "aiSw": 0,
    "autoLevelResult": "",
    "autohome": "X:0 Y:0 Z:0",
    "auxiliaryFanPct": 0,
    "bedTemp0": "27.130000",
    "bedTemp1": "0.000000",
    "bedTemp2": "0.000000",
    "bedTempAutoPid": 0,
    "boxTemp": 26,
    "caseFanPct": 0,
    "cfsConnect": 1,
    "connect": 1,
    "connectionCount": 2,
    "cornerVelocityLimits": 10,
    "curFeedratePct": 100,
    "curFlowratePct": 100,
    "curPosition": "X:0.00 Y:0.00 Z:0.00",
    "dProgress": 0,
    "deviceState": 0,
    "enableSelfTest": 0,
    "err": {
        "errcode": 0,
        "key": 0,
        "value": ""
    },
    "fan": 0,
    "fanAuxiliary": 0,
    "fanCase": 0,
    "feedState": 0,
    "hostname": "K2Plus-3D48",
    "layer": 0,
    "lightSw": 1,
    "materialDetect": 0,
    "materialDetector1": 1,
    "materialStatus": 0,
    "maxBedTemp": 120,
    "maxBoxTemp": 60,
    "maxNozzleTemp": 350,
    "model": "F008",
    "modelFanPct": 0,
    "modelVersion": "printer hw ver:;printer sw ver:;DWIN hw ver:CR0CN240110C10;DWIN sw ver:1.1.3.13;",
    "nozzleMoveSnapshot": 0,
    "nozzleTemp": "29.890000",
    "nozzleTempAutoPid": 0,
    "powerLoss": 0,
    "pressureAdvance": "0.038000",
    "printFileName": "",
    "printFileType": 1,
    "printId": "",
    "printJobTime": 0,
    "printLeftTime": 0,
    "printProgress": 0,
    "printStartTime": 0,
    "realTimeFlow": "0.000000",
    "realTimeSpeed": "0.000000",
    "repoPlrStatus": 0,
    "smoothTime": "0.038000",
    "state": 0,
    "targetBedTemp0": 0,
    "targetBedTemp1": 0,
    "targetBedTemp2": 0,
    "targetBoxTemp": 0,
    "targetNozzleTemp": 0,
    "tfCard": 1,
    "upgradeStatus": 0,
    "usedMaterialLength": 0,
    "velocityLimits": 800,
    "video": 1,
    "video1": 0,
    "videoElapse": 0,
    "videoElapseFrame": 0,
    "videoElapseInterval": 0,
    "webrtcSupport": 1,
    "withSelfTest": 0
}
```
</details>

### Periodic Updates

The printer sends real-time updates for changing parameters:

**Temperature updates:**
```json
{
  "nozzleTemp": "37.650000",
  "bedTemp0": "40.100000",
  "boxTemp": 31
}
```

**CFS status updates:**
```json
{
    "boxState": {
        "id": 1,
        "state": 1,
        "humidity": 38.0,
        "temp": 30.0
    }
}
```

### Communication Format

**Single parameter request:**
```json
{
    "method": "get/set",
    "params": {
        "parameter": 1
    }
}
```

**Multiple parameters request:**
```json
{
    "method": "get",
    "params": {
        "parameter_1": 1,
        "parameter_2": 1,
        "parameter_3": 1
    }
}
```

## Command Reference
All available Parameters that I have found:

### Request Parameters (get methods)

<details>
<summary>🔽 Click to expand all available Request Parameters</summary>

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `ReqPrinterPara`     | Request printer parameters             |
| `reqGcodeFile`       | Request G-code file list               |
| `reqHistory`         | Request print history                  |
| `reqElapseVideoList` | Request elapsed video list             |
| `reqOtaInfo`         | Request OTA update info                |
| `reqPrinterCfg`      | Request printer configuration          |
| `reqProbedMatrix`    | Request probed matrix                  |
| `reqPrintObjects`    | Request print objects                  |
| `reqMaterials`       | Request materials saved on the printer |
| `boxsInfo`           | Request CFS information                |
| `colorMatch`         | Color matching                         |

</details>

### Control Parameters (set methods)

<details>
<summary>🔽 Click to expand all available Control Parameters</summary>

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `colorMatch`           | Color matching                          |
| `boxConfig`            | CFS configuration                       |
| `modifyMaterial`       | Modify material settings                |
| `feedInOrOut`          | Feed in/out material                    |
| `multiColorPrint`      | Start CFS print                         |
| `opGcodeFile`          | Start Spool Holder Print                |
| `fan`                  | Fan control value                       |
| `fanCase`              | Case fan control                        |
| `fanAuxiliary`         | Auxiliary fan control                   |
| `nozzleTempControl`    | Nozzle temperature setpoint             |
| `boxTempControl`       | Box/chamber temperature control         |
| `bedTempControl`       | Bed temperature control                 |
| `stop`                 | Stop printing (0/1)                     |
| `pause`                | Pause printing (0/1)                    |
| `repoPlrStatus`        | Repository player status                |
| `gcodeCmd`             | Send G-code command                     |
| `setFeedratePct`       | Set feedrate percentage                 |
| `setFlowratePct`       | Set flowrate percentage                 |
| `setPosition`          | Set position (X Y Z coordinates)        |
| `autohome`             | Autohome command                        |
| `enableSelfTest`       | Enable self test (0/1)                  |
| `setZOffset`           | Set Z offset                            |
| `motorLock`            | Motor lock (0/1)                        |
| `heatersOff`           | Turn off all heaters (0/1)              |
| `velocityLimits`       | Set velocity limits                     |
| `accelerationLimits`   | Set acceleration limits                 |
| `cornerVelocityLimits` | Set corner velocity limits              |
| `accelToDecelLimits`   | Set acceleration to deceleration limits |
| `pressureAdvance`      | Set pressure advance value              |
| `smoothTime`           | Set smooth time                         |
| `videoElapse`          | Enable video lapse (0/1)                |
| `nozzleMoveSnapshot`   | Nozzle move snapshot (0/1)              |
| `videoElapseFrame`     | Video lapse frame setting               |
| `videoElapseInterval`  | Video lapse interval                    |
| `bedTempAutoPid`       | Bed temperature auto PID (0/1)          |
| `nozzleTempAutoPid`    | Nozzle temperature auto PID (0/1)       |
| `startAutoPid`         | Start auto PID tuning                   |
| `materialDetect`       | Material detection (0/1)                |
| `powerLossSw`          | Power loss recovery switch (0/1)        |
| `resonanceTest`        | Resonance test command                  |
| `manualLevel`          | Manual leveling command                 |
| `autoLevel`            | Auto leveling (0/1)                     |
| `restartKlipper`       | Restart Klipper (0/1)                   |
| `restartFirmware`      | Restart firmware (0/1)                  |
| `resetSystem`          | Reset system (0/1)                      |
| `exportLog`            | Export logs (0/1)                       |
| `linuxUpgrade`         | Linux system upgrade                    |
| `mcuUpgrade`           | MCU firmware upgrade                    |
| `lightSw`              | Light switch (0/1)                      |
| `setPrinterCfg`        | Set printer configuration               |
| `rmProbedMatrix`       | Remove probed matrix                    |
| `savePara`             | Save parameters (0/1)                   |
| `aiSw`                 | AI switch (0/1)                         |
| `aiDetection`          | AI detection (0/1)                      |
| `aiPausePrint`         | AI pause on detection (0/1)             |
| `aiFirstFloor`         | AI first floor detection (0/1)          |
| `deleteHistory`        | Delete history                          |
| `cleanErr`             | Clear errors (0/1)                      |
| `ctrlVideoFiles`       | Control video files (remove/rename)     |
| `excludeObjects`       | Exclude print objects                   |
| `hostname`             | Set hostname                            |
| `speedMode`            | Set speed mode                          |
| `deviceName`           | Set device name                         |

</details>

>Many of these can already be found in fluidd and are possible via Gcode commands.

## Particulary interesting commands are:

### Getting CFS Information (`boxsInfo`)

Fetches the status of the CFS and get its loaded filaments.

Request:
```json
{
    "method": "get",
    "params": {
        "boxsInfo": 1
    }
}
```

Response structure:
```json
{
  "boxsInfo": {
    "same_material": [
      "material_rfid_code", // e.g. "113725", "006001", "106001" (Is the "rfid" code of the material, but with a leading 1 if it loaded via RFID Tag or leading 0 if it entered via manual selection)
      "hex_color", //  hex filament color but with a leading 0. e.g. "0000000", "0ffffff"
      [
        {
          "boxId": 1, // box id 1-4
          "materialId": 0, // material slot 0-3 starting from the left
        },
      ],
      "material_type", // "PETG", "PLA"
    ],
    "materialBoxs": [
      {
        "id": 1, // box id 0-4, boxID 0 is the spool holder, boxID 1-4 are the CFS boxes
        "state": 1, // state 0,1 not sure, propaby connectivity status or operation/error status, need to confirm
        "type": 0, // type 0 for CFS, type 1 for spool holder
        "temp": 26.0, // current temperature inside the box in °C, only for CFS
        "humidity": 44.0, // current humidity inside the box in %RH, only for CFS
        "materials": [
          {
            "id": 1, // material slot 0-3 starting from the left
            "vendor": "Creality", // material vendor e.g. Creality, eSun, Kingroon
            "type": "PETG", // material type e.g. PLA, PETG
            "name": "CR-PETG", // material name
            "rfid": "23753", // RFIC code of the material. Not the actial RFID tag code, but the code stored in the system for that material. It can be used to match with the "same_material" list to get the color and type info.
            "color": "#0ffffff", // filament color in hex format with a leading 0, e.g. "#0000000", "#0fa7c0c"
            "minTemp": 220, // minimum printing temperature for the material in °C
            "maxTemp": 270, // maximum printing temperature for the material in °C
            "pressure": 0.1, // pressure advance value (Optional Value)
            "percent": 100, // remaining filament in %
            "state": 1, // material state: 0 = empty, 1 = material manually entered, without RFID Tag 2 = material loaded with RFID Tag
            "selected": 0, // whether the material is currently loaded in the hotend, 0 = not loaded, 1 = loaded
            "editStatus": 1, // edit status of the material, 0 = not editable, 1 = editable, 2 = newly added or reset, needs to be edited
          },
        ],
      },
    ],
  },
}

```
<details>

<summary>🔽 Click to show Payload example</summary>

```json
{
    "boxsInfo": {
        "same_material": [
            [
                "113725",
                "0000000",
                [{
                        "boxId": 1,
                        "materialId": 0
                    }
                ],
                "PETG"
            ],
            [
                "023753",
                "0000000",
                [{
                        "boxId": 1,
                        "materialId": 1
                    }, {
                        "boxId": 1,
                        "materialId": 3
                    }
                ],
                "PETG"
            ],
            [
                "106001",
                "0FA7C0C",
                [{
                        "boxId": 1,
                        "materialId": 2
                    }
                ],
                "PETG"
            ]
        ],
        "materialBoxs": [{
                "id": 0,
                "state": 0,
                "type": 1,
                "materials": [{
                        "id": 0,
                        "vendor": "",
                        "type": "",
                        "color": "",
                        "name": "",
                        "minTemp": 0,
                        "maxTemp": 0,
                        "selected": 0,
                        "percent": 100,
                        "editStatus": 2,
                        "rfid": "0",
                        "state": 1
                    }
                ]
            }, {
                "id": 1,
                "state": 1,
                "type": 0,
                "temp": 31.0,
                "humidity": 34.0,
                "materials": [{
                        "id": 0,
                        "vendor": "GEEETECH",
                        "type": "PETG",
                        "name": "PETG",
                        "rfid": "13725",
                        "color": "#0000000",
                        "diameter": 1.75,
                        "minTemp": 220,
                        "maxTemp": 270,
                        "pressure": 0.10000000000000001,
                        "percent": 100,
                        "state": 2,
                        "selected": 0,
                        "editStatus": 0
                    }, {
                        "id": 1,
                        "vendor": "Kingroon",
                        "type": "PETG",
                        "name": "PETG",
                        "rfid": "23753",
                        "color": "#0000000",
                        "minTemp": 220,
                        "maxTemp": 270,
                        "pressure": 0.10000000000000001,
                        "percent": 100,
                        "state": 1,
                        "selected": 0,
                        "editStatus": 1
                    }, {
                        "id": 2,
                        "vendor": "Creality",
                        "type": "PETG",
                        "name": "CR-PETG",
                        "rfid": "06001",
                        "color": "#0fa7c0c",
                        "diameter": 1.75,
                        "minTemp": 220,
                        "maxTemp": 270,
                        "pressure": 0.070000000000000007,
                        "percent": 63,
                        "state": 2,
                        "selected": 0,
                        "editStatus": 0
                    }, {
                        "id": 3,
                        "vendor": "Kingroon",
                        "type": "PETG",
                        "name": "PETG",
                        "rfid": "23753",
                        "color": "#0000000",
                        "minTemp": 220,
                        "maxTemp": 270,
                        "pressure": 0.10000000000000001,
                        "percent": 100,
                        "state": 1,
                        "selected": 0,
                        "editStatus": 1
                    }
                ]
            }
        ]
    }
}
```
</details>

### CFS Configuration (`boxConfig`)

Get current config:
```json
{
    "method": "get",
    "params": {
        "boxConfig": 1
    }
}
```

Set config:
```json
{
    "method": "set",
    "params": {
        "boxConfig": {
            "autoRefill": 1,
            "cAutoFeed": 1,
            "cSelfTest": 0,
            "cAutoUpdateFilament": 0
        }
    }
}
```

### Modify Material (`modifyMaterial`)

Update spool information:
```json
{
        "modifyMaterial": {
            "boxId": 1, // Id of the CFS 0-4 (0 for spool holder)
            "id": 0, // material slot 0-3 starting from the left
            "rfid": "06001", // RFIC code of the material. Not the actial RFID tag code, but the code stored in the system for that material. It can be used to match with the "same_material" list to get the color and type info.
            "type": "PLA", // material type e.g. PLA, PETG
            "vendor": "Creality", // material vendor e.g. Creality, eSun, Kingroon
            "name": "Hyper PLA", // material name
            "color": "#0000000", // filament color in hex format with a leading 0, e.g. "#0000000", "#0fa7c0c"
            "minTemp": 190, // minimum printing temperature for the material in °C
            "maxTemp": 240, // maximum printing temperature for the material in °C
            "pressure": "0.044" // pressure advance value (Optional Value)
        }
}
```

### Filament Loading/Unloading (`feedInOrOut`)

Load filament:
```json
    {
        "feedInOrOut": {
            "boxId": 1, // Id of the CFS 0-4 (0 for spool holder)
            "materialId": 1, // material slot 0-3 starting from the left
            "isFeed": 1 // 0 for Unloading, 1 for Loading Filament (boxId and materialId don't really matter while unloading)
        }
    }
```

### Color Matching (`colorMatch`)

Map slicer colors to CFS slots:
```json
{
        "colorMatch": {
            "path": "/mnt/UDISK/printer_data/gcodes/file.gcode", // path of the gcode file to color match (path always starts with "/mnt/UDISK/printer_data/gcodes/")
            "list": [
                {
                    "id": "T1A", // ID/Number of the filament in the slicer (T1A, T1B, T1C, T1D...)
                    "type": "PETG", // material type e.g. PLA, PETG (Slicer and CFS material must match)
                    "color": "#000000", // filament color in hex format, e.g. "#000000", "#fa7c0c"
                    "boxId": 1, // Id of the CFS 1-4 (0 would be the spool holder)
                    "materialId": 0 // material slot 0-3 starting from the left
                }
            ]
        }
    }
```

### Starting Prints

**CFS Print:**
```json
{
        "multiColorPrint": {
            "gcode": "/mnt/UDISK/printer_data/gcodes/file.gcode", // path of the gcode file to print (path always starts with "/mnt/UDISK/printer_data/gcodes/")
            "enableSelfTest": 0 // 0,1 toggle to perform printer calibration before the print
        }
    }
```

**Spool Holder Print:**
```json
{
        "opGcodeFile": "printprt:/mnt/UDISK/printer_data/gcodes/file.gcode", // path of the gcode file to print (path always starts with "/mnt/UDISK/printer_data/gcodes/")
        "enableSelfTest": 1 // 0,1 toggle to perform printer calibration before the print
}
```

### Send G-Code
```json
{
    "method": "set",
    "params": {
        "gcodeCmd": "G28"  // Any valid G-code command
    }
}
```

## Error Handling

Errors are automatically received via WebSocket:

**Example Error:**
```json
{
    "err": {
        "errcode": 500,
        "key": 121,
        "value": ""
    }
}
```

**Interpretation:** "CFS filament in use. To print with spool holder, unload CFS filament and reload spool holder before printing."

## Example

### Starting a Multi-Color Print

### Step 1: Color Matching
```json
{
    "method": "set",
    "params": {
        "colorMatch": {
            "path": "/mnt/UDISK/printer_data/gcodes/Cube_PETG_1m8s.gcode",
            "list": [
                {
                    "id": "T1C",
                    "type": "PETG",
                    "color": "#fa7c0c",
                    "boxId": 1,
                    "materialId": 2
                },
                {
                    "id": "T1A",
                    "type": "PETG",
                    "color": "#ffffff",
                    "boxId": 1,
                    "materialId": 1
                }
            ]
        }
    }
}
```

### Step 2: Start Print
```json
{
    "method": "set",
    "params": {
        "multiColorPrint": {
            "gcode": "/mnt/UDISK/printer_data/gcodes/Cube_PETG_1m8s.gcode",
            "enableSelfTest": 1
        }
    }
}
```