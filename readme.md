# Microflow
![GitHub package.json version](https://img.shields.io/github/package-json/v/ArnauNau/Microflow)
![Project Status: In Development](https://img.shields.io/badge/Status-In_Development-orange)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](https://opensource.org/licenses/MIT)

A rework of the classic ADT (Abstract Data Type) Diagram tool used in the Digital Systems and Microprocesors course at LaSalle Campus Barcelona - Universitat Ramón Llull.

## Features

*   Create and visualize Abstract Data Type (ADT) diagrams or Motor Finite State Machine (mFSM) diagrams.
*   Snappy and minimal interface.
*   Save and load diagrams locally (files).
*   Accessible from any device with a web browser.

## How to use
Using it is as easy as going to [microflow.app](https://microflow.app). If you are not familiar with Microflow, there is a blue information button you can click on the top right which will show all the ways you can use Microflow.

## Why a rework
This version aims to be an evolution of the old one by making it accessible instantly form any device, without the need of source code download and compilation, or program installation. It also provides better support for a wide range of devices by leveraging the existing browser ecosystem.

## Contributing 

Contributions are welcome! Please see what needs to be done in the issues tab, or make your own features. You will probably need to read the next section.

## How to build 
If you are interested in contributing or changing the code, this section is for you. If not you'd probably do better skipping this section.

Microflow is all local, that means it doesn't call any API or external service, the only traffic is the initial one when loading the website. This is subject to change if usage metrics are to be extracted in the future.

The project is built in TypeScript with no other dependencies which makes easy to build and run. 

### Prerequisites
In order to build the project yourself you need to have:
* Node.js (v16 or higher) or Bun.
* npm (v8 or higher) or Bun.

### Steps
1. Clone the repository.
2. Run `npm install` in the repository directory.
3. Run `npm run build`. It will perform some housekeeping before compiling the project.

> [!TIP]
> To automatically rebuild the project when a change is detected you can use `npm run build-watch`.

To test the project I use the Live Server VS Code plugin, you can use whatever method you want.

If you want to host the project yourself, you're welcome to do so following the License terms. Since the project is self-contained and implemented as a static website you have a wide range of free options to host your own version of Microflow.

## License 

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## Support - Contact

For support please open an issue if the README doesn't have the answer you are looking for.
If you happen to find a bug, open an issue describing the buggy behavior you stumbled upon, together with screenshots or screen recordings showing said behavior, and some sort of explanation of what the expected behavior was.

For all other reasons you are welcome to contact me at [a@rnau.me](mailto:a@rnau.me).

<br>

*by: Arnau Sanz (a@rnau.me)*