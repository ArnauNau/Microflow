# Microflow
A rework of the classic ADT (Abstract Data Type) Diagram tool used in the Digital Systems and Microprocesors course at LaSalle.

## How to use
Using it is as easy as going to [microflow.app](www.microflow.app). If you are not familiar with Microflow, there is a blue information button you can click on the top right which will show all the ways you can use Microflow.

## Why a rework
This version aims to be an evolution of the old one by 

## How to build
If you are interested in contributing or changing the code, this section is for you. If not you'd probably do better skipping this section.

Microflow is all local, that means it doesn't call any API or external service, the only traffic is the initial one when loading the website. This is subject to change if usage metrics are to be extracted in the future.

The project is built in TypeScript with no other dependencies which makes easy to build and run. In order to build the project yourself you need to:
1. Have npm (Node.js) or bun installed.
2. Clone the repository.
3. Run `npm install` in the repository directory.
4. Run `npx tsc` 

> [!TIP]
> To automatically rebuild the project when a change is detected you can use `npx tsc --watch`.

To test the project I use the Live Server VS Code plugin, you can use whatever method you want.

If you want to host the project yourself, you're welcome to do so following the License terms. Since the project is self-contained and implemented as a static website you have a wide range of free options to host your own version of Microflow.



*by: Arnau Sanz (arnau.sf@salle.url.edu or a@rnau.me)*